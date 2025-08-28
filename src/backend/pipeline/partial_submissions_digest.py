#!/usr/bin/env python3

import argparse
import logging
import json
from datetime import datetime, timedelta
from collections import defaultdict
from urllib.request import urlopen
import urllib.parse

from wbtools.db.dbmanager import WBDBManager

from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import EmailManager

# Widget categories for tracking completion
WIDGET_CATEGORIES = ["Overview", "Genetics", "Reagent", "Expression", "Interactions", "Phenotypes", "Disease", "Comments"]

logger = logging.getLogger(__name__)


def get_partial_submissions(db_manager, afp_base_url, start_date=None):
    """
    Get papers with partial submissions - those that have some data but haven't been fully submitted
    """
    partial_submissions = []
    
    # If no start_date specified, use the beginning of current year
    if start_date is None:
        start_date = datetime(2025, 1, 1)
    
    with db_manager:
        # Get papers that have been processed but may not have completed submission
        # We'll use a similar approach to reminder_email.py
        # First get papers that were emailed recently (which means they're in the AFP system)
        papers_to_check = []
        
        # Get papers that have been emailed but not submitted (similar to reminder_email.py)
        try:
            # Get papers emailed in the last year (365 days)
            for paper_data in db_manager.afp.get_papers_emails_no_submission_emailed_between(1, 365):
                paper_id = paper_data[0]
                papers_to_check.append(paper_id)
        except Exception as e:
            logger.debug(f"Could not get papers from emailed list: {e}")
        
        # Also check papers that have been modified but not submitted
        # This requires querying the database directly
        try:
            query = """
                SELECT DISTINCT joinkey FROM afp 
                WHERE afp_lasttouched IS NOT NULL 
                AND afp_lasttouched >= %s
                AND (afp_version IS NULL OR afp_version = '')
            """
            results = db_manager.execute_query(query, (start_date,))
            for row in results:
                if row[0] not in papers_to_check:
                    papers_to_check.append(row[0])
        except Exception as e:
            logger.debug(f"Could not query afp table directly: {e}")
        
        # Now check each paper
        for paper_id in papers_to_check:
            try:
                # Check if paper has been fully submitted
                if db_manager.afp.author_has_submitted(paper_id):
                    continue  # Skip fully submitted papers
                
                # Check if paper has any activity
                if not db_manager.afp.author_has_modified(paper_id):
                    continue  # Skip papers with no activity
                
                # Get paper details
                paper_title = db_manager.paper.get_paper_title(paper_id)
                paper_journal = db_manager.paper.get_paper_journal(paper_id)
                paper_pmid = db_manager.paper.get_pmid(paper_id)
                
                # Get AFP form link
                afp_form_link = db_manager.afp.get_afp_form_link(paper_id, afp_base_url)
                
                # Get widget completion information
                widgets_info = get_completed_widgets_info(db_manager, paper_id)
                
                # Only include if there's at least some widget data
                if widgets_info['total_completed'] > 0:
                    paper_info = {
                        'paper_id': paper_id,
                        'title': paper_title if paper_title else "No title available",
                        'journal': paper_journal if paper_journal else "Unknown",
                        'pmid': paper_pmid if paper_pmid else "N/A",
                        'form_link': afp_form_link,
                        'widgets_completed': widgets_info['widgets'],
                        'total_completed': widgets_info['total_completed'],
                        'completion_dates': widgets_info['dates']
                    }
                    partial_submissions.append(paper_info)
            except Exception as e:
                logger.debug(f"Error processing paper {paper_id}: {e}")
                continue
    
    return partial_submissions


def get_completed_widgets_info(db_manager, paper_id):
    """
    Check which widgets have been completed for a given paper
    Returns a summary of widget completion status
    """
    widgets_info = {
        'widgets': {},
        'dates': {},
        'total_completed': 0
    }
    
    # Map widget categories to the corresponding database tables
    # Check for row existence, not content - empty strings still mean the widget was saved
    widget_table_mappings = {
        "Overview": ["afp_genestudied", "afp_species", "afp_otherspecies", "afp_structcorr"],
        "Genetics": ["afp_variation", "afp_strain", "afp_structcorr", "afp_seqchange", 
                     "afp_othervariation", "afp_otherstrain"],
        "Reagent": ["afp_transgene", "afp_othertransgene", "afp_antibody", "afp_otherantibody"],
        "Expression": ["afp_otherexpr", "afp_siteaction", "afp_timeaction", "afp_rnaseq", 
                       "afp_additionalexpr"],
        "Interactions": ["afp_geneprod", "afp_genereg", "afp_geneint"],
        "Phenotypes": ["afp_newmutant", "afp_rnai", "afp_overexpr", "afp_chemphen", 
                       "afp_envpheno", "afp_catalyticact", "afp_othergenefunc"],
        "Disease": ["afp_humdis"],
        "Comments": ["afp_comment"]
    }
    
    # Check each widget category by looking for row existence in tables
    for widget_name, table_names in widget_table_mappings.items():
        widget_has_data = False
        
        for table_name in table_names:
            try:
                # Check if any rows exist in this table for this paper
                # Use direct SQL query to check row existence
                paper_id_clean = paper_id.replace('WBPaper', '') if paper_id.startswith('WBPaper') else paper_id
                query = f"SELECT COUNT(*) FROM {table_name} WHERE joinkey = %s"
                result = db_manager.execute_query(query, (paper_id_clean,))
                
                if result and result[0][0] > 0:
                    widget_has_data = True
                    break  # At least one table has rows
            except Exception as e:
                logger.debug(f"Could not check table {table_name} for paper {paper_id}: {e}")
                continue
        
        widgets_info['widgets'][widget_name] = widget_has_data
        if widget_has_data:
            widgets_info['total_completed'] += 1
    
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
        
        # Create short URL if we have a form link
        if form_url != "N/A":
            try:
                data = urlopen("http://tinyurl.com/api-create.php?url=" + urllib.parse.quote(form_url))
                tiny_url = data.read().decode('utf-8')
                form_link_html = f'<a href="{tiny_url}">Open Form</a>'
            except:
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
    email_manager = EmailManager(config=config, email_passwd=args.email_passwd)
    
    try:
        # Get partial submissions
        logger.info(f"Fetching partial submissions since {start_date}")
        partial_submissions = get_partial_submissions(db_manager, args.afp_base_url, start_date)
        
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
