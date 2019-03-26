import argparse
import logging

from db_manager import DBManager
from email_functions import send_new_data_notification_email_to_watcher


#AFP_WATCHERS_TABLES = {
#        "hinxton@warmbase.org": ["afp_structcorr", "afp_seqchange", "afp_othervariation", "afp_strain",
#                                 "afp_otherstrain", "afp_rnaseq"],
#        "karen@wormbase.org": ["afp_othertransgene", "afp_overexpr"],
#        "daniela@wormbase.org": ["tfp_otherantibody", "afp_otherexpr", "afp_additionalexpr", "afp_comment"],
#        "raymond@wormbase.org": ["afp_siteaction", "afp_timeaction"],
#        "jae.cho@wormbase.org": ["afp_geneprod"],
#        "garys@caltech.edu": ["afp_newmutant", "afp_rnai", "afp_chemphen", "afp_envpheno"],
#        "vanauken@caltech.edu": ["afp_catalyticact", "afp_comment"],
#        "ranjana@caltech.edu": ["afp_humdis"]
#    }

AFP_WATCHERS_TABLES = {
       "valearna@caltech.edu": ["afp_structcorr", "afp_seqchange", "afp_othervariation", "afp_strain",
                                "afp_otherstrain", "afp_rnaseq", "afp_humdis"],
   }


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str)
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-p", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")

    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    for afp_watcher, tables_to_watch in AFP_WATCHERS_TABLES.items():
        for table_to_watch in tables_to_watch:
            positive_papers = db_manager.get_positive_paper_ids_sumbitted_last_month_for_data_type(table_to_watch)
            send_new_data_notification_email_to_watcher(table_to_watch, positive_papers, afp_watcher, args.email_passwd)
    db_manager.close()


if __name__ == '__main__':
    main()
