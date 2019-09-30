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
from collections import defaultdict
from tqdm import tqdm


class TqdmHandler(logging.StreamHandler):
    def __init__(self):
        logging.StreamHandler.__init__(self)

    def emit(self, record):
        msg = self.format(record)
        tqdm.write(msg)


TPC_PAPERS_PER_QUERY = 10


logger = logging.getLogger(__name__)


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
    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)

    # 1. Get list of curatable papers
    logger.info("Getting the list of curatable papers from WormBase DB")
    curatable_papers = db_manager.get_set_of_curatable_papers()
    logger.debug("Number of curatable papers: " + str(len(curatable_papers)))

    # 2. Get list of papers that have been already processed by AFP
    logger.info("Getting the list of papers that have already been processed by AFP - either emailed or not")
    processed_papers = db_manager.get_set_of_afp_processed_papers()
    logger.debug("Number of papers that have already been processed by AFP: " + str(len(processed_papers)))

    # 3. Calculate difference between 1. and 2.
    curatable_papers_not_processed = curatable_papers - processed_papers
    logger.debug("Number of curatable papers not yet emailed to authors: " +
                 str(len(curatable_papers_not_processed)))

    # 4. Get list of SVM flagged papers
    logger.info("Getting the list of papers that are flagged by an SVM")
    papers_svm_flags = db_manager.get_svm_flagged_papers()
    logger.debug("Number of SVM flagged papers: " + str(len(papers_svm_flags)))

    # 5. Calculate intersection between 3. and 4. and sort by paper id (i.e., by timestamp - new papers first)
    curatable_papers_not_processed_svm_flagged = sorted(list(curatable_papers_not_processed &
                                                             set(papers_svm_flags.keys())),
                                                        reverse=True)
    logger.debug("Number of papers curatable, not emailed, and SVM flagged: " +
                 str(len(curatable_papers_not_processed_svm_flagged)))

    # disable ssl key verification
    if not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
        ssl._create_default_https_context = ssl._create_unverified_context

    #curatable_papers_not_processed_svm_flagged = ["00057005"]

    # 6. Get fulltext for papers obtained in 5. from Textpresso
    logger.info("Getting papers fulltext")
    fulltexts_dict = {}
    email_addr_in_papers_dict = defaultdict(list)
    processed_papers = 0
    fulltexts_success = 0
    # process N papers for each Tpc call and continue until the number of papers with fulltext is >= n
    while len(fulltexts_dict) < args.num_papers and len(curatable_papers_not_processed_svm_flagged) > 0:
        paper_to_process = curatable_papers_not_processed_svm_flagged.pop(0)
        logger.info("Extracting fulltext for paper " + paper_to_process)
        paper_fulltext = get_fulltext_from_pdfs(db_manager.get_paper_pdf_paths(paper_id=paper_to_process))
        processed_papers += 1
        if paper_fulltext != "":
            fulltexts_success += 1
            fulltexts_dict[paper_to_process] = paper_fulltext
            logger.info("Extracting email address from paper")
            email_addr_in_papers_dict[paper_to_process] = get_first_valid_email_address_from_paper(
                fulltext=fulltexts_dict[paper_to_process], db_manager=db_manager, paper_id=paper_to_process)
            if not email_addr_in_papers_dict[paper_to_process]:
                logger.info("Removing paper with no email address")
                del fulltexts_dict[paper_to_process]
                fulltexts_success -= 1
        else:
            logger.warning("Removing paper with empty text")

    # 7. Get the list of genes, alleles, strains etc from fulltext
    logger.info("Getting the list of entities from DB")
    genes_vocabulary = set(db_manager.get_all_genes())
    gene_ids_cgc_name = db_manager.get_gene_cgc_name_from_id_map()
    alleles_vocabulary = set(db_manager.get_all_alleles())
    strains_vocabulary = set(db_manager.get_all_strains())
    transgene_vocabulary = set(db_manager.get_all_transgenes())
    genes_in_papers_dict = defaultdict(set)
    alleles_in_papers_dict = defaultdict(set)
    strains_in_papers_dict = defaultdict(set)
    transgenes_in_papers_dict = defaultdict(set)
    species_in_papers_dict = defaultdict(set)
    papers_passwd = {}
    taxon_species_map = db_manager.get_taxonid_speciesnamearr_map()

    gene_symbol_id_map = db_manager.get_gene_name_id_map()
    allele_symbol_id_map = db_manager.get_allele_name_id_map()
    transgene_symbol_id_map = db_manager.get_transgene_name_id_map()
    paper_titles = {paper_id: db_manager.get_paper_title(paper_id=paper_id) for paper_id in fulltexts_dict.keys()}
    db_manager.close()

    for paper_id, fulltext in tqdm(fulltexts_dict.items()):
        logger.info("Processing paper " + paper_id)

        logger.info("Getting list of genes through string matching")
        get_matches_in_fulltext(fulltext, genes_vocabulary, genes_in_papers_dict, paper_id, 2, match_uppercase=True)
        get_matches_in_fulltext(paper_titles[paper_id], genes_vocabulary, genes_in_papers_dict,
                                paper_id, 1, match_uppercase=True)
        logger.info("Getting list of alleles through string matching")
        get_matches_in_fulltext(fulltext, alleles_vocabulary, alleles_in_papers_dict, paper_id, 2)
        get_matches_in_fulltext(paper_titles[paper_id], alleles_vocabulary, alleles_in_papers_dict, paper_id, 1)
        logger.info("Getting list of strains through string matching")
        get_matches_in_fulltext(fulltext, strains_vocabulary, strains_in_papers_dict, paper_id, 1)
        get_matches_in_fulltext(paper_titles[paper_id], strains_vocabulary, strains_in_papers_dict, paper_id, 1)
        logger.info("Getting list of transgenes through string matching")
        get_matches_in_fulltext(fulltext, transgene_vocabulary, transgenes_in_papers_dict, paper_id, 1)
        get_matches_in_fulltext(paper_titles[paper_id], transgene_vocabulary, transgenes_in_papers_dict, paper_id, 1)
        logger.info("Getting list of species through string matching")
        get_species_in_fulltext_from_regex(fulltext, species_in_papers_dict, paper_id, taxon_species_map, 10)
        get_species_in_fulltext_from_regex(paper_titles[paper_id], species_in_papers_dict, paper_id,
                                           taxon_species_map, 1)
    logger.info("Transforming gene keywords into gene ids")
    gene_ids_counters = defaultdict(int)
    for paper_id, genes_list in genes_in_papers_dict.items():
        for gene_word in genes_list:
            gene_ids_counters[gene_symbol_id_map[gene_word]] += 1
    gene_ids_in_documents = {paper_id: set([gene_symbol_id_map[gene_word] + ";%;" + gene_word if
                                            gene_ids_counters[gene_symbol_id_map[gene_word]] < 2 else
                                            gene_symbol_id_map[gene_word] + ";%;" +
                                            gene_ids_cgc_name[gene_symbol_id_map[gene_word]] for gene_word in
                                            genes_list if gene_word in gene_symbol_id_map]) for
                             paper_id, genes_list in genes_in_papers_dict.items()}
    logger.info("Transforming allele keywords into allele ids")
    allele_ids_in_documents = {paper_id: set([allele_symbol_id_map[allele_word] + ";%;" + allele_word for
                                              allele_word in allele_list if allele_word in allele_symbol_id_map])
                               for paper_id, allele_list in alleles_in_papers_dict.items()}
    logger.info("Transforming transgene keywords into transgene ids")
    transgene_ids_in_documents = {paper_id: set([transgene_symbol_id_map[transgene_word] + ";%;" + transgene_word
                                                 for transgene_word in transgenes_in_papers_dict[paper_id] if
                                                 transgene_word in transgene_symbol_id_map]) for paper_id in
                                  list(fulltexts_dict.keys())}

    def entities_not_empty(pap_id):
        return pap_id in gene_ids_in_documents and len(gene_ids_in_documents[pap_id]) > 0 or \
               pap_id in allele_ids_in_documents and len(allele_ids_in_documents[pap_id]) > 0 or \
               pap_id in transgene_ids_in_documents and len(transgene_ids_in_documents[pap_id]) > 0 or \
               pap_id in strains_in_papers_dict and len(strains_in_papers_dict[pap_id]) > 0

    if args.print_stats:
        print("Statistics calculated on the latest set of " + str(args.num_papers) + " papers that can be processed by "
                                                                                     "AFP")
        print()
        print("Number of processed papers: " + str(processed_papers))
        print("Number of fulltexts successfully extracted with corresponding author registered at WB: " +
              str(fulltexts_success))
        print("Number of papers with non-empty entity lists: " + str(len(
            [paper_id for paper_id in fulltexts_dict.keys() if entities_not_empty(paper_id)])))
        print("Average number of genes extracted: " + str(np.average(
            [len(entity_list) if entity_list else 0 for entity_list in gene_ids_in_documents.values()])))
        print("Average number of species extracted: " + str(np.average(
            [len(entity_list) if entity_list else 0 for entity_list in species_in_papers_dict.values()])))
        print("Average number of alleles extracted: " + str(np.average(
            [len(entity_list) if entity_list else 0 for entity_list in allele_ids_in_documents.values()])))
        print("Average number of transgenes extracted: " + str(np.average(
            [len(entity_list) if entity_list else 0 for entity_list in transgene_ids_in_documents.values()])))
        print("Average number of strains extracted: " + str(np.average(
            [len(entity_list) if entity_list else 0 for entity_list in strains_in_papers_dict.values()])))
        exit(0)

    # 8. Write values extracted through tpc to DB and notify
    urls = []
    tinyurls = []
    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    for paper_id in list(fulltexts_dict.keys()):
        if db_manager.get_paper_antibody(paper_id):
            db_manager.set_antibody(paper_id)
        db_manager.set_extracted_entities_in_paper(paper_id, list(gene_ids_in_documents[paper_id])
                                                   if paper_id in gene_ids_in_documents else [], "tfp_genestudied")
        db_manager.set_extracted_entities_in_paper(paper_id, list(allele_ids_in_documents[paper_id])
                                                   if paper_id in allele_ids_in_documents else [], "tfp_variation")
        db_manager.set_extracted_entities_in_paper(paper_id, list(set(species_in_papers_dict[paper_id]))
                                                   if paper_id in species_in_papers_dict else [], "tfp_species")
        db_manager.set_extracted_entities_in_paper(paper_id, list(set(strains_in_papers_dict[paper_id]))
                                                   if paper_id in strains_in_papers_dict else [], "tfp_strain")
        db_manager.set_extracted_entities_in_paper(paper_id, list(transgene_ids_in_documents[paper_id])
                                                   if paper_id in transgene_ids_in_documents else [], "tfp_transgene")
        papers_passwd[paper_id] = db_manager.get_passwd(paper_id=paper_id)
        if not papers_passwd[paper_id]:
            papers_passwd[paper_id] = time.time()
            db_manager.set_passwd(paper_id, papers_passwd[paper_id])
        db_manager.set_version(paper_id)
        paper_title = db_manager.get_paper_title(paper_id)
        paper_journal = db_manager.get_paper_journal(paper_id)
        pmid = db_manager.get_pmid(paper_id)
        doi = db_manager.get_doi_from_paper_id(paper_id)

        hide_genes = "true" if paper_id in gene_ids_in_documents and len(gene_ids_in_documents[paper_id]) > 100 else \
            "false"
        hide_alleles = "true" if paper_id in gene_ids_in_documents and len(gene_ids_in_documents[paper_id]) > 100 else \
            "false"
        hide_strains = "true" if paper_id in gene_ids_in_documents and len(gene_ids_in_documents[paper_id]) > 100 else \
            "false"
        # notify author(s) via email
        if email_addr_in_papers_dict[paper_id]:
            url = args.afp_base_url + "?paper=" + paper_id + "&passwd=" + \
                  str(papers_passwd[paper_id]) + "&title=" + urllib.parse.quote(paper_title) + "&journal=" + \
                  urllib.parse.quote(paper_journal) + "&pmid=" + pmid + "&personid=" + \
                  email_addr_in_papers_dict[paper_id][0].replace("two", "") + "&hide_genes=" + hide_genes + \
                  "&hide_alleles=" + hide_alleles + "&hide_strains=" + hide_strains + "&doi=" + urllib.parse.quote(doi)
            urls.append(url)
            data = urlopen("http://tinyurl.com/api-create.php?url=" + urllib.parse.quote(url))
            tiny_url = data.read().decode('utf-8')
            tinyurls.append(tiny_url)
            if entities_not_empty(paper_id):
                if args.dev_mode:
                    send_email_to_author(paper_id, paper_title, paper_journal, tiny_url, args.admin_emails,
                                         args.email_passwd)
                else:
                    send_email_to_author(paper_id, paper_title, paper_journal, tiny_url,
                                         [email_addr_in_papers_dict[paper_id][1]], args.email_passwd)
            else:
                notify_admin_of_paper_without_entities(paper_id, paper_title, paper_journal, tiny_url,
                                                       args.admin_emails, args.email_passwd)
            db_manager.set_email(paper_id, [email_addr_in_papers_dict[paper_id][1]])

    # commit and close connection to DB
    logger.info("Committing changes to DB")
    db_manager.close()
    send_summary_email_to_admin(urls=tinyurls, paper_ids=list(fulltexts_dict.keys()),
                                recipients=args.admin_emails,
                                email_passwd=args.email_passwd)
    logger.info("Finished")


if __name__ == '__main__':
    main()
