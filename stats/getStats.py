import argparse
import logging
import os
import re
import ssl
from collections import defaultdict
from db_manager import DBManager
from tpc_api_functions import get_documents_fulltext
from entity_extraction import get_matches_in_fulltext, get_species_in_fulltext_from_regex

TPC_PAPERS_PER_QUERY = 10


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str)
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-t", "--textpresso-token", metavar="Textpresso API token", dest="textpresso_token", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default to stdout")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    parser.add_argument("-s", "--sample-size", metavar="sample_size", dest="sample_size", type=int, default=1000,
                        help="sample size")

    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    logger = logging.getLogger("AFP Script for statistics")

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

    # Sample papers

    # disable ssl key verification
    if not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
        ssl._create_default_https_context = ssl._create_unverified_context

    # 6. Get fulltext for papers obtained in 5. from Textpresso
    logger.info("Getting papers fulltext from Textpresso")
    fulltexts_dict = {}
    email_addr_in_papers_dict = defaultdict(list)
    # process N papers for each Tpc call and continue until the number of papers with fulltext is >= n
    while len(fulltexts_dict) < args.num_papers and len(curatable_papers_not_processed_svm_flagged) > 0:
        if len(curatable_papers_not_processed_svm_flagged) >= TPC_PAPERS_PER_QUERY:
            papers_to_process = curatable_papers_not_processed_svm_flagged[0:TPC_PAPERS_PER_QUERY]
            curatable_papers_not_processed_svm_flagged = curatable_papers_not_processed_svm_flagged[
                                                         TPC_PAPERS_PER_QUERY:]
        else:
            papers_to_process = curatable_papers_not_processed_svm_flagged
            curatable_papers_not_processed_svm_flagged = []
        paper_ids = ["WBPaper" + paper_id for paper_id in papers_to_process]
        logger.info("Getting the fulltext of the processed papers from Textpresso API")
        fulltexts_dict.update(get_documents_fulltext(args.textpresso_token, paper_ids))
        logger.info("Extracting email addresses from papers")
        for wb_paper_id in paper_ids:
            paper_id = wb_paper_id.replace("WBPaper", "")
            if paper_id in fulltexts_dict:
                email_addr_in_papers_dict[paper_id] = re.findall(r'[^@^ ]+@[^@^ ]+\.[^@^ ]+',
                                                                 fulltexts_dict[paper_id])
        logger.info("Removing papers with no email address")
        fulltexts_dict = {paper_id: fulltext for paper_id, fulltext in fulltexts_dict.items() if
                          len(email_addr_in_papers_dict[paper_id]) > 0}
    # cap the number of papers
    if len(fulltexts_dict) > args.num_papers:
        fulltexts_dict = {key: fulltexts_dict[key] for key in list(fulltexts_dict)[0:args.num_papers]}

    # 7. Get the list of genes, alleles, strains etc from fulltext
    logger.info("Getting the list of entities from DB")
    genes_vocabulary = set(db_manager.get_all_genes())
    gene_ids_cgc_name = db_manager.get_gene_cgc_name_from_id_map()
    alleles_vocabulary = set(db_manager.get_all_alleles())
    strains_vocabulary = set(db_manager.get_all_strains())
    transgene_vocabulary = set(db_manager.get_all_transgenes())
    genes_in_papers_dict = defaultdict(list)
    alleles_in_papers_dict = defaultdict(list)
    strains_in_papers_dict = defaultdict(list)
    transgenes_in_papers_dict = defaultdict(list)
    species_in_papers_dict = defaultdict(list)
    papers_passwd = {}
    taxon_species_map = db_manager.get_taxonid_speciesnamearr_map()

    gene_symbol_id_map = db_manager.get_gene_name_id_map()
    allele_symbol_id_map = db_manager.get_allele_name_id_map()
    transgene_symbol_id_map = db_manager.get_transgene_name_id_map()
    db_manager.close()

    for paper_id, fulltext in fulltexts_dict.items():
        logger.info("Processing paper " + paper_id)
        logger.info("Getting list of genes through string matching")
        get_matches_in_fulltext(fulltext, genes_vocabulary, genes_in_papers_dict, paper_id, 2, match_uppercase=True)
        logger.info("Getting list of alleles through string matching")
        get_matches_in_fulltext(fulltext, alleles_vocabulary, alleles_in_papers_dict, paper_id, 2)
        logger.info("Getting list of strains through string matching")
        get_matches_in_fulltext(fulltext, strains_vocabulary, strains_in_papers_dict, paper_id, 1)
        logger.info("Getting list of transgenes through string matching")
        get_matches_in_fulltext(fulltext, transgene_vocabulary, transgenes_in_papers_dict, paper_id, 1)
        logger.info("Getting list of species through string matching")
        get_species_in_fulltext_from_regex(fulltext, species_in_papers_dict, paper_id, taxon_species_map, 3)
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