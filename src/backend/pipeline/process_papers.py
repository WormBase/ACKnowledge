#!/usr/bin/env python3

import argparse

from wbtools.db.dbmanager import WBDBManager
from wbtools.literature.corpus import CorpusManager

from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import *
from src.backend.pipeline.abc_entities import get_tfp_values_for_papers
from src.backend.pipeline.abc_paper_selection import load_papers_from_abc

logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-p", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
    parser.add_argument("-S", "--email-user", metavar="email_user", dest="email_user", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    parser.add_argument("-n", "--num-papers", metavar="num_papers", dest="num_papers", type=int, default=10,
                        help="number of papers to process per run")
    parser.add_argument("-a", "--admin-emails", metavar="admin_emails", dest="admin_emails", type=str, nargs="+",
                        help="list of email addresses of administrators that will receive summary emails with pipeline "
                             "reports at each iterations")
    parser.add_argument("-u", "--afp-base-url", metavar="afp_base_url", dest="afp_base_url", type=str)
    parser.add_argument("-d", "--dev-mode", dest="dev_mode", action="store_true")
    parser.add_argument("-s", "--stats", dest="print_stats", action="store_true")
    parser.add_argument("-i", "--paper-ids", metavar="paper_ids", dest="paper_ids", type=str, nargs="+",
                        help="process the provided list of papers instead of reading them from db")
    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')
    config = load_config_from_file()
    email_manager = EmailManager(config=config, email_passwd=args.email_passwd, email_user=args.email_user)

    db_manager = WBDBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    cm = CorpusManager()
    if args.paper_ids:
        cm.load_from_wb_database(
            args.db_name, args.db_user, args.db_password, args.db_host, paper_ids=args.paper_ids,
            load_pdf_files=False, must_be_autclass_flagged=False, exclude_no_author_email=True)
    else:
        load_papers_from_abc(cm, args.db_name, args.db_user, args.db_password, args.db_host,
                             selection_config=config["abc_paper_selection"], num_papers=args.num_papers)
    logger.info(f"Entities are taken from the ABC entity extractor: ACKnowledge-extracted entities must not be "
                f"imported into the ABC after {config['abc_entities']['import_cutoff']} (SCRUM-6592)")
    tfp_values = get_tfp_values_for_papers(cm.get_all_papers(), config["ntt_extraction"]["exclusion_list"])
    tinyurls = []
    emailed_papers = []
    blacklisted_email_addresses = db_manager.generic.get_blacklisted_email_addresses()
    with email_manager:
        for paper in cm.get_all_papers():
            logging.info("processing paper " + str(paper.paper_id))
            paper.title = paper.title if paper.title else ""
            values = tfp_values[paper.paper_id]
            genes_id_name = values["genes"]
            alleles_id_name = values["alleles"]
            strains_id_name = values["strains"]
            transgenes_id_name = values["transgenes"]
            species = values["species"]
            authors = paper.get_authors_with_email_address_in_wb(blacklisted_email_addresses=blacklisted_email_addresses,
                                                                 first_only=False)
            with db_manager:
                passwd = db_manager.afp.save_extracted_data_to_db(
                    paper_id=paper.paper_id, genes=genes_id_name, alleles=alleles_id_name, species=species,
                    strains=strains_id_name, transgenes=transgenes_id_name,
                    author_emails=[author[1] for author in authors])

            if authors:
                feedback_form_tiny_url = EmailManager.get_feedback_form_tiny_url(
                    afp_base_url=args.afp_base_url, paper_id=paper.paper_id, passwd=passwd, genes=genes_id_name,
                    alleles=alleles_id_name, strains=strains_id_name, title=paper.title, journal=paper.journal,
                    pmid=paper.pmid, corresponding_author_id=authors[0][0].person_id, doi=paper.doi)
                tinyurls.append(feedback_form_tiny_url)
                emailed_papers.append(paper.paper_id)

                if genes_id_name or alleles_id_name or transgenes_id_name or strains_id_name:
                    # Get list of all author emails for coauthor coordination
                    all_author_emails = [author[1] for author in authors]

                    for author in authors:
                        # Get coauthor emails (all authors except current recipient)
                        coauthor_emails = [email for email in all_author_emails if email != author[1]]

                        author_specific_form_link = EmailManager.get_feedback_form_tiny_url(
                            afp_base_url=args.afp_base_url, paper_id=paper.paper_id, passwd=passwd, genes=genes_id_name,
                            alleles=alleles_id_name, strains=strains_id_name, title=paper.title, journal=paper.journal,
                            pmid=paper.pmid, corresponding_author_id=author[0].person_id, doi=paper.doi)
                        # Emails carry the encoded form of the link: some mail
                        # gateways corrupt '=' followed by two hex digits in the
                        # body, which silently destroys paper/passwd/personid
                        # (issue #424). The log keeps the readable URL.
                        author_specific_email_link = to_redirect_url(args.afp_base_url,
                                                                     author_specific_form_link)
                        logger.info(
                            f"Sending email to {author[1]} (person_id: {author[0].person_id}) "
                            f"for paper {paper.paper_id}: {author_specific_form_link}"
                        )
                        if not args.dev_mode:
                            email_manager.send_email_to_author(
                                paper.paper_id, paper.title, paper.journal,
                                author_specific_email_link, [author[1]], coauthor_emails)
                    if args.dev_mode:
                        email_manager.send_email_to_author(paper.paper_id, paper.title, paper.journal,
                                                           to_redirect_url(args.afp_base_url,
                                                                           feedback_form_tiny_url),
                                                           args.admin_emails, [])
                else:
                    email_manager.notify_admin_of_paper_without_entities(paper.paper_id, paper.title,
                                                                         paper.journal, feedback_form_tiny_url,
                                                                         args.admin_emails)
        email_manager.send_summary_email_to_admin(urls=tinyurls, paper_ids=emailed_papers, recipients=args.admin_emails)
    logger.info("Pipeline finished successfully")


if __name__ == '__main__':
    main()
