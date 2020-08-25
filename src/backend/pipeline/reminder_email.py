#!/usr/bin/env python3

import argparse
import logging
import time
import urllib.parse

from urllib.request import urlopen

from src.backend.common.dbmanager import DBManager
from src.backend.common.emailtools import send_reminder_to_author


logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Send reminder emails to authors who have not submitted their data to "
                                                 "AFP")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str)
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-p", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
    parser.add_argument("-u", "--afp-base-url", metavar="afp_base_url", dest="afp_base_url", type=str)
    parser.add_argument("-w", "--tazendra-username", metavar="tazendra_user", dest="tazendra_user", type=str)
    parser.add_argument("-z", "--tazendra-password", metavar="tazendra_password", dest="tazendra_password", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")

    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host,
                           tazendra_user=args.tazendra_user, tazendra_password=args.tazendra_password)
    # first reminder after one month
    for options in (((1, 2), False), ((2, 3), True)):
        for paper_id_email_arr in db_manager.get_papers_and_emails_without_submission_emailed_between_months(options[0][0], options[0][1]):
            paper_id = paper_id_email_arr[0]
            author_email = paper_id_email_arr[1]
            paper_title = db_manager.get_paper_title(paper_id)
            paper_journal = db_manager.get_paper_journal(paper_id)
            afp_link = db_manager.get_afp_form_link(paper_id, args.afp_base_url)
            data = urlopen("http://tinyurl.com/api-create.php?url=" + urllib.parse.quote(afp_link))
            tiny_url = data.read().decode('utf-8')
            send_reminder_to_author(paper_id, paper_title, paper_journal, tiny_url, [author_email], args.email_passwd,
                                    options[1])
            logger.info("going to sleep for ~15 minutes")
            time.sleep(1000)
    logger.info("finished sending reminder emails")
    db_manager.close()


if __name__ == '__main__':
    main()
