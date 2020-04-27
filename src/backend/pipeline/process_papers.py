#!/usr/bin/env python3

import argparse
import os
import ssl
import time
import urllib.parse
import numpy as np

from urllib.request import urlopen
from src.backend.common.emailtools import *
from src.backend.common.nttxtraction import *
from src.backend.common.dbmanager import DBManager
from tqdm import tqdm
from src.backend.common.paperinfo import PaperInfo


class TqdmHandler(logging.StreamHandler):
    def __init__(self):
        logging.StreamHandler.__init__(self)

    def emit(self, record):
        msg = self.format(record)
        tqdm.write(msg)


TPC_PAPERS_PER_QUERY = 10


logger = logging.getLogger(__name__)


def save_extracted_data_to_db(db_manager: DBManager, paper_id, paper_info, passwd):
    if db_manager.get_paper_antibody(paper_id):
        db_manager.set_antibody(paper_id)
    db_manager.set_extracted_entities_in_paper(paper_id, paper_info.genes, "tfp_genestudied")
    db_manager.set_extracted_entities_in_paper(paper_id, paper_info.alleles, "tfp_variation")
    db_manager.set_extracted_entities_in_paper(paper_id, paper_info.species, "tfp_species")
    db_manager.set_extracted_entities_in_paper(paper_id, paper_info.strains, "tfp_strain")
    db_manager.set_extracted_entities_in_paper(paper_id, paper_info.transgenes, "tfp_transgene")
    db_manager.set_version(paper_id)
    db_manager.set_passwd(paper_id, passwd)
    db_manager.set_email(paper_id, [paper_info.corresponding_author_email])


def get_feedback_form_tiny_url(afp_base_url, paper_id, paper_info, passwd):
    hide_genes = "true" if len(paper_info.genes) > 100 else "false"
    hide_alleles = "true" if len(paper_info.alleles) > 100 else "false"
    hide_strains = "true" if len(paper_info.strains) > 100 else "false"
    url = afp_base_url + "?paper=" + paper_id + "&passwd=" + str(passwd) + "&title=" + \
          urllib.parse.quote(paper_info.title) + "&journal=" + urllib.parse.quote(paper_info.journal) + "&pmid=" + \
          paper_info.pmid + "&personid=" + paper_info.corresponding_author_id.replace("two", "") + "&hide_genes=" + \
          hide_genes + "&hide_alleles=" + hide_alleles + "&hide_strains=" + hide_strains + "&doi=" + \
          urllib.parse.quote(paper_info.doi)
    data = urlopen("http://tinyurl.com/api-create.php?url=" + urllib.parse.quote(url))
    return data.read().decode('utf-8')


def print_stats(num_papers, papers_info):
    print("Statistics calculated on the latest set of " + str(num_papers) + " papers that can be processed by AFP")
    print()
    print("Number of fulltexts successfully extracted with corresponding author registered at WB: " +
          str(len(papers_info)))
    print("Number of papers with non-empty entity lists: " + str(len(
        [paper_info for paper_info in papers_info if paper_info.entities_not_empty()])))
    print("Average number of genes extracted: " + str(np.average(
        [len(paper_info.genes) if paper_info.genes else 0 for paper_info in papers_info])))
    print("Average number of species extracted: " + str(np.average(
        [len(paper_info.species) if paper_info.species else 0 for paper_info in papers_info])))
    print("Average number of alleles extracted: " + str(np.average(
        [len(paper_info.alleles) if paper_info.alleles else 0 for paper_info in papers_info])))
    print("Average number of transgenes extracted: " + str(np.average(
        [len(paper_info.transgenes) if paper_info.transgenes else 0 for paper_info in papers_info])))
    print("Average number of strains extracted: " + str(np.average(
        [len(paper_info.strains) if paper_info.strains else 0 for paper_info in papers_info])))


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-p", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
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

    ntt_extractor = NttExtractor(args.tpc_token, dbname=args.db_name, user=args.db_user, password=args.db_password,
                                 host=args.db_host, config_file=os.path.join(os.getcwd(), "src/backend/config.yml"))
    processable_papers = ntt_extractor.get_processable_papers()
    processable_papers = ["00056618", "00056678", "00056814", "00056901", "00056956", "00056988"]
    papers_info = ntt_extractor.extract_entities(paper_ids=processable_papers, max_num_papers=args.num_papers)
    if args.print_stats:
        print_stats(args.num_papers, papers_info)
        exit(0)
    tinyurls = []
    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    for paper_info in papers_info:
        passwd = db_manager.get_passwd(paper_id=paper_info.paper_id)
        passwd = time.time() if not passwd else passwd
        if not args.dev_mode:
            save_extracted_data_to_db(db_manager, paper_info.paper_id, paper_info, passwd)
        if paper_info.corresponding_author_email:
            feedback_form_tiny_url = get_feedback_form_tiny_url(args.afp_base_url, paper_info.paper_id, paper_info,
                                                                passwd)
            tinyurls.append(feedback_form_tiny_url)
            if paper_info.entities_not_empty():
                if args.dev_mode:
                    send_email_to_author(paper_info.paper_id, paper_info.title, paper_info.journal,
                                         feedback_form_tiny_url, args.admin_emails, args.email_passwd)
                else:
                    send_email_to_author(paper_info.paper_id, paper_info.title, paper_info.journal,
                                         feedback_form_tiny_url, [paper_info.corresponding_author_email],
                                         args.email_passwd)
            else:
                notify_admin_of_paper_without_entities(paper_info.paper_id, paper_info.title, paper_info.journal,
                                                       feedback_form_tiny_url, args.admin_emails, args.email_passwd)

    # commit and close connection to DB
    logger.info("Committing changes to DB")
    db_manager.close()
    send_summary_email_to_admin(urls=tinyurls, paper_ids=[pap_info.paper_id for pap_info in papers_info],
                                recipients=args.admin_emails, email_passwd=args.email_passwd)
    logger.info("Finished")


if __name__ == '__main__':
    main()
