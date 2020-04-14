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


def read_and_set_papers_metadata(paper_ids, num_papers, db_manager, ntt_extractor):
    logger.info("Getting papers fulltext and metadata")
    papers_info = []
    for paper_id, fulltext, (person_id, email) in ntt_extractor.get_first_valid_paper_ids_fulltexts_and_emails(
            paper_ids=paper_ids, max_papers=num_papers):
        paper_info = PaperInfo()
        paper_info.paper_id = paper_id
        paper_info.fulltext = fulltext
        paper_info.corresponding_author_email = email
        paper_info.corresponding_author_id = person_id
        paper_info.title = db_manager.get_paper_title(paper_id=paper_id)
        paper_info.journal = db_manager.get_paper_journal(paper_id)
        paper_info.pmid = db_manager.get_pmid(paper_id)
        paper_info.doi = db_manager.get_doi_from_paper_id(paper_id)
        papers_info.append(paper_info)
    return papers_info


def extract_entities_from_text(genes, alleles, strains, transgenes, gene_symbol_id_map, gene_ids_cgc_name,
                               allele_symbol_id_map, transgene_symbol_id_map, ntt_extractor, papers_info):
    augmented_papers_info = []
    for paper_info in tqdm(papers_info):
        logger.info("Processing paper " + paper_info.paper_id)
        logger.info("Getting list of genes through string matching")
        paper_info.genes = list(set(ntt_extractor.extract_keywords(
            genes, paper_info.fulltext, match_uppercase=True, min_matches=2)) | set(
            ntt_extractor.extract_keywords(genes, paper_info.title, match_uppercase=True)))

        logger.info("Getting list of alleles through string matching")
        paper_info.alleles = list(set(ntt_extractor.extract_keywords(
            alleles, paper_info.fulltext, match_uppercase=True, min_matches=2)) | set(
            ntt_extractor.extract_keywords(alleles, paper_info.title, match_uppercase=True)))

        logger.info("Getting list of strains through string matching")
        paper_info.strains = list(set(ntt_extractor.extract_keywords(
            strains, paper_info.fulltext, match_uppercase=True, min_matches=1)) | set(
            ntt_extractor.extract_keywords(strains, paper_info.title, match_uppercase=True)))

        logger.info("Getting list of transgenes through string matching")
        paper_info.transgenes = list(set(ntt_extractor.extract_keywords(
            transgenes, paper_info.fulltext, match_uppercase=True, min_matches=1)) | set(
            ntt_extractor.extract_keywords(transgenes, paper_info.title, match_uppercase=True)))

        logger.info("Getting list of species through string matching")
        paper_info.species = list(set(ntt_extractor.extract_species(
            paper_info.fulltext, min_matches=10)) | set(
            ntt_extractor.extract_species(paper_info.title)))

        logger.info("Transforming gene keywords into gene ids")
        paper_info.genes = ntt_extractor.get_entity_ids_from_names(paper_info.genes, gene_symbol_id_map,
                                                                   gene_ids_cgc_name)
        logger.info("Transforming allele keywords into allele ids")
        paper_info.alleles = ntt_extractor.get_entity_ids_from_names(paper_info.genes, allele_symbol_id_map)
        logger.info("Transforming transgene keywords into transgene ids")
        paper_info.transgenes = ntt_extractor.get_entity_ids_from_names(paper_info.genes, transgene_symbol_id_map)
        augmented_papers_info.append(paper_info)
    return augmented_papers_info


def get_processable_papers(db_manager):
    logger.info("Getting the list of curatable papers from WormBase DB")
    curatable_papers = db_manager.get_set_of_curatable_papers()
    logger.debug("Number of curatable papers: " + str(len(curatable_papers)))

    logger.info("Getting the list of papers that have already been processed by AFP - either emailed or not")
    processed_papers = db_manager.get_set_of_afp_processed_papers()
    logger.debug("Number of papers that have already been processed by AFP: " + str(len(processed_papers)))

    curatable_papers_not_processed = curatable_papers - processed_papers
    logger.debug("Number of curatable papers not yet emailed to authors: " +
                 str(len(curatable_papers_not_processed)))

    logger.info("Getting the list of papers that are flagged by an SVM")
    papers_svm_flags = db_manager.get_svm_flagged_papers()
    logger.debug("Number of SVM flagged papers: " + str(len(papers_svm_flags)))

    curatable_papers_not_processed_svm_flagged = sorted(list(curatable_papers_not_processed &
                                                             set(papers_svm_flags.keys())),
                                                        reverse=True)
    logger.debug("Number of papers curatable, not emailed, and SVM flagged: " +
                 str(len(curatable_papers_not_processed_svm_flagged)))
    return curatable_papers_not_processed_svm_flagged


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

    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    ntt_extractor = NttExtractor(args.tpc_token, db_manager)
    processable_papers = get_processable_papers(db_manager)
    # processable_papers = ["00059183"]
    papers_info = read_and_set_papers_metadata(paper_ids=processable_papers, num_papers=args.num_papers,
                                               db_manager=db_manager, ntt_extractor=ntt_extractor)
    # read entity lists and name-id maps
    genes = db_manager.get_all_genes()
    alleles = db_manager.get_all_alleles()
    strains = db_manager.get_all_alleles()
    transgenes = db_manager.get_all_transgenes()
    gene_symbol_id_map = db_manager.get_gene_name_id_map()
    gene_ids_cgc_name = db_manager.get_gene_cgc_name_from_id_map()
    allele_symbol_id_map = db_manager.get_allele_name_id_map()
    transgene_symbol_id_map = db_manager.get_transgene_name_id_map()
    # close db_manager here to free cursors before extraction
    db_manager.close()
    papers_info = extract_entities_from_text(genes=genes, alleles=alleles, strains=strains, transgenes=transgenes,
                                             gene_symbol_id_map=gene_symbol_id_map, gene_ids_cgc_name=gene_ids_cgc_name,
                                             allele_symbol_id_map=allele_symbol_id_map,
                                             transgene_symbol_id_map=transgene_symbol_id_map,
                                             ntt_extractor=ntt_extractor, papers_info=papers_info)
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
