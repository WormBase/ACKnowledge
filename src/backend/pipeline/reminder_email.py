#!/usr/bin/env python3

import argparse
import logging
import time

from wbtools.db.dbmanager import WBDBManager

from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import EmailManager

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
    parser.add_argument("-d", "--dev-mode", dest="dev_mode", action="store_true")
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")

    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    db_manager = WBDBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    config = load_config_from_file()
    email_manager = EmailManager(config=config, email_passwd=args.email_passwd)
    # first reminder after one month
    with db_manager:
        for paper_id_email_arr in db_manager.afp.get_papers_emails_no_submission_emailed_between(1, 5):
            paper_id = paper_id_email_arr[0]
            author_email = paper_id_email_arr[1]
            paper_title = db_manager.paper.get_paper_title(paper_id)
            paper_journal = db_manager.paper.get_paper_journal(paper_id)
            afp_link = db_manager.afp.get_afp_form_link(paper_id, args.afp_base_url)
            if afp_link:
                # data = urlopen("http://tinyurl.com/api-create.php?url=" + urllib.parse.quote(afp_link))
                # tiny_url = data.read().decode('utf-8')
                if not args.dev_mode:
                    email_manager.send_reminder_to_author(paper_id=paper_id, paper_title=paper_title,
                                                          paper_journal=paper_journal, afp_link=afp_link,
                                                          recipients=[author_email], final_call=False)
                    logger.info("going to sleep for ~30 minutes")
                    time.sleep(2000)
            else:
                logger.warning("skipping email address removed from db")
    logger.info("Pipeline finished successfully")


if __name__ == '__main__':
    main()
