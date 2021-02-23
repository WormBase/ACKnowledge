#!/usr/bin/env python3

import argparse
import os
import ssl

from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import *
from src.backend.common.nttxtraction import *
from src.backend.common.dbmanager import DBManager
from src.backend.common.paperinfo import print_papers_stats

logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-p", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
    parser.add_argument("-w", "--tazendra-username", metavar="tazendra_user", dest="tazendra_user", type=str)
    parser.add_argument("-z", "--tazendra-password", metavar="tazendra_password", dest="tazendra_password", type=str)
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
    parser.add_argument("-t", "--textpresso-apitoken", metavar="tpc_token", dest="tpc_token", type=str)
    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    if not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
        ssl._create_default_https_context = ssl._create_unverified_context

    config = load_config_from_file()
    ntt_extractor = NttExtractor(args.tpc_token, dbname=args.db_name, user=args.db_user, password=args.db_password,
                                 host=args.db_host, config=config, tazendra_user=args.tazendra_user,
                                 tazendra_password=args.tazendra_password)
    email_manager = EmailManager(config=config, email_passwd=args.email_passwd)
    processable_papers = ntt_extractor.get_processable_papers()
    papers_info = ntt_extractor.extract_entities(paper_ids=processable_papers, max_num_papers=args.num_papers)
    if args.print_stats:
        print_papers_stats(args.num_papers, papers_info)
        exit(0)
    tinyurls = []
    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host,
                           tazendra_user=args.tazendra_user, tazendra_password=args.tazendra_password)
    for paper_info in papers_info:
        passwd = db_manager.save_extracted_data_to_db(paper_info)
        if paper_info.corresponding_author_email:
            feedback_form_tiny_url = EmailManager.get_feedback_form_tiny_url(args.afp_base_url, paper_info.paper_id,
                                                                             paper_info, passwd)
            tinyurls.append(feedback_form_tiny_url)
            if paper_info.entities_not_empty():
                if args.dev_mode:
                    email_manager.send_email_to_author(paper_info.paper_id, paper_info.title, paper_info.journal,
                                                       feedback_form_tiny_url, args.admin_emails)
                else:
                    email_manager.send_email_to_author(paper_info.paper_id, paper_info.title, paper_info.journal,
                                                       feedback_form_tiny_url, [paper_info.corresponding_author_email])
            else:
                email_manager.notify_admin_of_paper_without_entities(paper_info.paper_id, paper_info.title,
                                                                     paper_info.journal, feedback_form_tiny_url,
                                                                     args.admin_emails)

    # commit and close connection to DB
    logger.info("Committing changes to DB")
    db_manager.close()
    email_manager.send_summary_email_to_admin(urls=tinyurls, paper_ids=[pap_info.paper_id for pap_info in papers_info],
                                              recipients=args.admin_emails)
    logger.info("Pipeline finished successfully")


if __name__ == '__main__':
    main()
