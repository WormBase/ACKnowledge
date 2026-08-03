#!/usr/bin/env python3

import argparse
import logging
from datetime import datetime, timezone
from wbtools.db.dbmanager import WBDBManager

from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import EmailManager

# Widget categories for tracking completion
WIDGET_CATEGORIES = ["Overview", "Genetics", "Reagent", "Expression", "Interactions", "Phenotypes", "Disease", "Comments"]

# Tables backing each widget, keyed by the category names above. A widget
# counts as completed when a row exists for the paper: the form writes a row
# on save, and an empty value is a deliberate "nothing to report" answer
# rather than an untouched widget.
WIDGET_TABLE_MAPPINGS = {
    "Overview": ["afp_genestudied", "afp_species", "afp_otherspecies", "afp_structcorr"],
    "Genetics": ["afp_variation", "afp_strain", "afp_structcorr", "afp_seqchange",
                 "afp_othervariation", "afp_otherstrain"],
    "Reagent": ["afp_transgene", "afp_othertransgene", "afp_antibody", "afp_otherantibody"],
    "Expression": ["afp_otherexpr", "afp_siteaction", "afp_timeaction", "afp_rnaseq"],
    "Interactions": ["afp_geneprod", "afp_genereg", "afp_geneint"],
    "Phenotypes": ["afp_newmutant", "afp_rnai", "afp_overexpr", "afp_chemphen",
                   "afp_envpheno", "afp_catalyticact", "afp_othergenefunc"],
    "Disease": ["afp_humdis"],
    "Comments": ["afp_comment"]
}

logger = logging.getLogger(__name__)


def get_partial_submissions(db_manager, afp_base_url, start_date=None):
    """
    Get papers with partial submissions - those that have some data but haven't been fully submitted

    "Partial" means the same thing here as it does on the curator dashboard,
    and comes from the same query (wbtools' QUERY_PAPER_IDS_PARTIAL_SUBMISSION):
    the paper is in the AFP system, at least one widget holds data, and there
    is no afp_lasttouched row - that row is written on final submission, so its
    absence is what distinguishes a partial submission from a complete one.
    """
    # If no start_date specified, use the beginning of current year
    if start_date is None:
        start_date = datetime(2025, 1, 1)
    # afp_timestamp columns are 'timestamp with time zone', so psycopg2 returns
    # aware datetimes; the CLI default and -s both produce naive ones, and
    # comparing the two raises TypeError.
    if start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)

    partial_submissions = []

    with db_manager:
        paper_ids = db_manager.afp.get_paper_ids_afp_partial_submission()
        logger.info(f"{len(paper_ids)} papers with a partial submission on record")
        widgets_by_paper = get_widgets_info_for_papers(db_manager, paper_ids)

        for paper_id in sorted(widgets_by_paper):
            widgets_info = widgets_by_paper[paper_id]

            # Only include if there's at least some widget data
            if widgets_info['total_completed'] == 0:
                continue

            # Report on what the author has worked on since start_date
            last_activity = max(widgets_info['dates'].values()) if widgets_info['dates'] else None
            if last_activity is not None and last_activity < start_date:
                continue

            try:
                paper_title = db_manager.paper.get_paper_title(paper_id)
                paper_journal = db_manager.paper.get_paper_journal(paper_id)
                paper_pmid = db_manager.paper.get_pmid(paper_id)
                afp_form_link = db_manager.afp.get_afp_form_link(paper_id, afp_base_url)
            except Exception as e:
                logger.warning(f"Skipping paper {paper_id}, could not read its details: {e}")
                continue

            partial_submissions.append({
                'paper_id': paper_id,
                'title': paper_title if paper_title else "No title available",
                'journal': paper_journal if paper_journal else "Unknown",
                'pmid': paper_pmid if paper_pmid else "N/A",
                'form_link': afp_form_link,
                'widgets_completed': widgets_info['widgets'],
                'total_completed': widgets_info['total_completed'],
                'completion_dates': widgets_info['dates']
            })

    return partial_submissions


def rollback_aborted_transaction(db_manager):
    """
    Clear an aborted transaction so that later queries on the shared
    connection can still run
    """
    try:
        db_manager.conn.rollback()
    except Exception as e:
        logger.warning(f"Could not roll back the aborted transaction: {e}")


def get_widgets_info_for_papers(db_manager, paper_ids):
    """
    Check which widgets have been completed for each of the given papers
    Returns {paper_id: summary of widget completion status}

    One query per widget table covering every paper at once, rather than per
    (paper, table): a monthly report spans hundreds of papers, and the latter
    shape issued ~30 queries for each of them.
    """
    widgets_info = {paper_id: {'widgets': {category: False for category in WIDGET_CATEGORIES},
                               'dates': {},
                               'total_completed': 0}
                    for paper_id in paper_ids}
    joinkeys = list(widgets_info.keys())
    if not joinkeys:
        return widgets_info

    for widget_name, table_names in WIDGET_TABLE_MAPPINGS.items():
        for table_name in table_names:
            try:
                with db_manager.get_cursor() as curs:
                    curs.execute(f"SELECT joinkey, max(afp_timestamp) FROM {table_name} "
                                 f"WHERE joinkey = ANY(%s) GROUP BY joinkey", (joinkeys,))
                    rows = curs.fetchall()
            except Exception as e:
                # Logged at WARNING on purpose: swallowing this at DEBUG level is
                # what let the report claim zero partial submissions every month.
                logger.warning(f"Could not check table {table_name}: {e}")
                # get_cursor() shares one cursor and connection across these
                # queries and never rolls back, so a failed statement leaves the
                # transaction aborted and every table after it would raise
                # InFailedSqlTransaction - turning one unreadable table back into
                # an empty report. Nothing here writes, so a rollback costs us
                # nothing.
                rollback_aborted_transaction(db_manager)
                continue

            for joinkey, last_modified in rows:
                paper_widgets = widgets_info.get(joinkey)
                if paper_widgets is None:
                    continue
                if not paper_widgets['widgets'][widget_name]:
                    paper_widgets['widgets'][widget_name] = True
                    paper_widgets['total_completed'] += 1
                # A widget can span several tables; report the most recent edit
                known_date = paper_widgets['dates'].get(widget_name)
                if last_modified and (known_date is None or last_modified > known_date):
                    paper_widgets['dates'][widget_name] = last_modified

    return widgets_info


def format_report_rows(partial_submissions, afp_base_url):
    """
    Format the partial submission rows for the email template
    """
    rows_html = ""
    
    for paper in partial_submissions:
        paper_id = paper['paper_id']
        
        # Generate dashboard link
        dashboard_url = f"https://dashboard.acknowledge.textpressolab.com/paper?paper_id={paper_id}"
        
        # Use the form link from the database
        form_url = paper['form_link'] if paper['form_link'] else "N/A"
        
        # Create form link HTML
        if form_url != "N/A":
            form_link_html = f'<a href="{form_url}">Open Form</a>'
        else:
            form_link_html = "N/A"
        
        # Count completed widgets
        total_widgets = len(WIDGET_CATEGORIES)
        completed_count = paper['total_completed']
        
        # Format widget completion details
        widget_details = []
        for widget_name, is_completed in paper['widgets_completed'].items():
            if is_completed:
                date_str = ""
                if widget_name in paper['completion_dates']:
                    date_str = f" ({paper['completion_dates'][widget_name].strftime('%Y-%m-%d')})"
                widget_details.append(f"✓ {widget_name}{date_str}")
            else:
                widget_details.append(f"○ {widget_name}")
        
        widget_details_html = "<br/>".join(widget_details)
        
        # Add row
        rows_html += f"""
            <tr>
                <td style='padding: 8px;'>{paper_id}</td>
                <td style='padding: 8px;'><a href='{dashboard_url}'>View Dashboard</a></td>
                <td style='padding: 8px;'>{form_link_html}</td>
                <td style='padding: 8px; text-align: center;'><b>{completed_count}/{total_widgets}</b></td>
                <td style='padding: 8px; font-size: 0.9em;'>{widget_details_html}</td>
            </tr>
        """
    
    return rows_html


def main():
    parser = argparse.ArgumentParser(description="Send monthly digest of partial submissions to ACKnowledge admins")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str)
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-p", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
    parser.add_argument("-S", "--email-user", metavar="email_user", dest="email_user", type=str)
    parser.add_argument("-a", "--afp-base-url", metavar="afp_base_url", dest="afp_base_url", type=str,
                        default="https://acknowledge.textpressolab.com")
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./partial_submissions.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    parser.add_argument("-t", "--test", dest="test", action="store_true",
                        help="test mode - send emails to test recipients only")
    parser.add_argument("-s", "--start-date", metavar="start_date", dest="start_date", type=str,
                        help="Start date for report in YYYY-MM-DD format (default: 2025-01-01)")

    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    # Parse start date if provided
    start_date = None
    if args.start_date:
        try:
            start_date = datetime.strptime(args.start_date, "%Y-%m-%d")
        except ValueError:
            logger.error(f"Invalid date format: {args.start_date}. Use YYYY-MM-DD format.")
            return
    else:
        # Default to beginning of 2025
        start_date = datetime(2025, 1, 1)

    # Load configuration
    config = load_config_from_file()
    db_manager = WBDBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    email_manager = EmailManager(config=config, email_passwd=args.email_passwd, email_user=args.email_user)
    
    try:
        # Get partial submissions
        logger.info(f"Fetching partial submissions since {start_date}")
        partial_submissions = get_partial_submissions(db_manager, args.afp_base_url, start_date)

        with email_manager:
            if partial_submissions:
                logger.info(f"Found {len(partial_submissions)} partial submissions")

                # Format the report rows
                rows_html = format_report_rows(partial_submissions, args.afp_base_url)

                # Get email configuration from config file
                email_config = config.get('emails', {})

                # Determine recipients from config or use defaults
                if args.test:
                    recipients = ["valearna@caltech.edu"]  # Test recipient
                else:
                    recipients = email_config.get('partial_submissions_recipients',
                                                  ['daniela@wormbase.org', 'vanauken@caltech.edu'])

                # Format subject and content using templates from config
                current_date_str = datetime.now().strftime("%B %d, %Y")
                month_year_str = datetime.now().strftime("%B %Y")
                start_date_str = start_date.strftime("%B %d, %Y")

                # Get subject and content templates
                subject_template = email_config.get('subject_partial_submissions',
                                                    "ACKnowledge Monthly Partial Submissions Report - {}")
                content_template = email_config.get('content_partial_submissions',
                                                    "<h2>Report</h2><p>No template found</p>")

                # Format the email
                subject = subject_template.format(month_year_str)
                content = content_template.format(
                    current_date_str,
                    start_date_str,
                    rows_html,
                    len(partial_submissions)
                )

                # Send email using the email manager
                email_manager.send_email(
                    subject=subject,
                    content=content,
                    recipients=recipients
                )

                logger.info(f"Partial submissions report sent to {', '.join(recipients)}")
            else:
                logger.info("No partial submissions found for the specified period")

                # Optionally send a notification that there are no partial submissions
                if not args.test:
                    email_config = config.get('emails', {})
                    recipients = email_config.get('partial_submissions_recipients',
                                                  ['daniela@wormbase.org', 'vanauken@caltech.edu'])

                    subject = f"ACKnowledge Monthly Partial Submissions Report - {datetime.now().strftime('%B %Y')}"
                    content = f"""
                    <h2>ACKnowledge Partial Submissions Report - {datetime.now().strftime("%B %d, %Y")}</h2>
                    <p>No partial submissions found since {start_date.strftime("%B %d, %Y")}.</p>
                    <br/>
                    <p>All papers have either been fully submitted or have not been started.</p>
                    """

                    email_manager.send_email(
                        subject=subject,
                        content=content,
                        recipients=recipients
                    )
                    logger.info(f"No partial submissions notification sent to {', '.join(recipients)}")

    except Exception as e:
        logger.error(f"Error generating partial submissions report: {e}")
        raise
    
    logger.info("Partial submissions digest completed successfully")


if __name__ == '__main__':
    main()
