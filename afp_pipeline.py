#!/usr/bin/env python3

import argparse
import logging
import os
import ssl
import psycopg2
import time
import urllib.parse

from db_functions import *
from email_functions import send_email
from tpc_api_functions import *
from vocabulary_extraction_functions import *
from collections import defaultdict


TPC_PAPERS_PER_QUERY = 10


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-p", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
    parser.add_argument("-t", "--textpresso-token", metavar="Textpresso API token", dest="textpresso_token", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    parser.add_argument("-n", "--num-papers", metavar="num_papers", dest="num_papers", type=int, default=10,
                        help="number of papers to process per run")
    parser.add_argument("-w", "--wait-time", metavar="wait_time", dest="wait_time", type=int, default=1209600,
                        help="number of seconds between each run")

    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    logger = logging.getLogger("AFP Pipeline")

    conn = psycopg2.connect("dbname='testdb' user='valerio' password='asdf1234' host='131.215.52.92'")
    cur = conn.cursor()

    # 1. Get list of curatable papers
    logger.info("Getting the list of curatable papers from WormBase DB")
    curatable_papers = get_set_of_curatable_papers(cur)
    logger.debug("Number of curatable papers: " + str(len(curatable_papers)))

    # 2. Get list of papers that have been already processed by AFP
    logger.info("Getting the list of papers that have already been processed by AFP - either emailed or not")
    processed_papers = get_set_of_afp_processed_papers(cur)
    logger.debug("Number of papers that have already been processed by AFP: " + str(len(processed_papers)))

    # 3. Calculate difference between 1. and 2.
    curatable_papers_not_processed = curatable_papers - processed_papers
    logger.debug("Number of curatable papers not yet emailed to authors: " +
                 str(len(curatable_papers_not_processed)))

    # 4. Get list of SVM flagged papers
    logger.info("Getting the list of papers that are flagged by an SVM")
    papers_svm_flags = get_svm_flagged_papers(cur)
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

    #TODO remove this line
    curatable_papers_not_processed_svm_flagged = ["00050093", "00053123", "00054889", "00054967", "00053873",
                                                  "00053739", "00054192"]

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
        # paper_ids = ["WBPaper00050052", "WBPaper00002892"]
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
    # cap the number of papers to 10
    if len(fulltexts_dict) > args.num_papers:
        fulltexts_dict = {key: fulltexts_dict[key] for key in list(fulltexts_dict)[0:args.num_papers]}

    # 7. Get the list of genes, alleles, strains etc from fulltext
    logger.info("Getting the list of entities from DB")
    genes_vocabulary = set(get_all_genes(cur))
    proteins_vocabulary = set([gene.upper() for gene in genes_vocabulary])
    protein_gene_map = {gene.upper(): gene for gene in genes_vocabulary}
    alleles_vocabulary = set(get_all_alleles(cur))
    strains_vocabulary = set(get_all_strains(cur))
    transgene_vocabulary = set(get_all_transgenes(cur))
    genes_in_papers_dict = defaultdict(list)
    proteins_in_papers_dict = defaultdict(list)
    alleles_in_papers_dict = defaultdict(list)
    strains_in_papers_dict = defaultdict(list)
    transgenes_in_papers_dict = defaultdict(list)
    species_in_papers_dict = defaultdict(list)
    papers_passwd = {}

    gene_symbol_id_map = get_gene_name_id_map(cur)
    allele_symbol_id_map = get_allele_name_id_map(cur)
    transgene_symbol_id_map = get_transgene_name_id_map(cur)
    cur.close()
    conn.close()

    for paper_id, fulltext in fulltexts_dict.items():
        logger.info("Processing paper " + paper_id)
        logger.info("Getting list of genes through string matching")
        get_matches_in_fulltext(fulltext, genes_vocabulary, genes_in_papers_dict, paper_id, 2)
        logger.info("Getting list of proteins to genes through string matching")
        get_matches_in_fulltext(fulltext, proteins_vocabulary, proteins_in_papers_dict, paper_id, 2)
        logger.info("Getting list of alleles through string matching")
        get_matches_in_fulltext(fulltext, alleles_vocabulary, alleles_in_papers_dict, paper_id, 2)
        logger.info("Getting list of strains through string matching")
        get_matches_in_fulltext(fulltext, strains_vocabulary, strains_in_papers_dict, paper_id, 2)
        logger.info("Getting list of transgenes through string matching")
        get_matches_in_fulltext(fulltext, transgene_vocabulary, transgenes_in_papers_dict, paper_id, 2)
        logger.info("Getting list of species through string matching")
        get_species_in_fulltext_from_regex(fulltext, species_in_papers_dict, paper_id)
    logger.info("Transforming gene keywords into gene ids")
    for paper_id, proteins_list in proteins_in_papers_dict.items():
        genes_in_papers_dict[paper_id].extend([protein_gene_map[protein] for protein in proteins_list])
    gene_ids_in_documents = {paper_id: set([gene_symbol_id_map[gene_word] + ";%;" + gene_word for gene_word in
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

    # 8. Write values extracted through tpc to DB and notify
    conn = psycopg2.connect("dbname='testdb' user='valerio' password='asdf1234' host='131.215.52.92'")
    cur = conn.cursor()
    for paper_id in list(fulltexts_dict.keys()):
        write_extracted_entities_in_paper(cur, paper_id, list(gene_ids_in_documents[paper_id])
                                          if paper_id in gene_ids_in_documents else [], "tfp_genestudied")
        write_extracted_entities_in_paper(cur, paper_id, list(allele_ids_in_documents[paper_id])
                                          if paper_id in allele_ids_in_documents else [], "tfp_variation")
        write_extracted_entities_in_paper(cur, paper_id, list(set(species_in_papers_dict[paper_id]))
                                          if paper_id in species_in_papers_dict else [], "tfp_species")
        write_extracted_entities_in_paper(cur, paper_id, list(set(strains_in_papers_dict[paper_id]))
                                          if paper_id in strains_in_papers_dict else [], "tfp_strain")
        write_extracted_entities_in_paper(cur, paper_id, list(transgene_ids_in_documents[paper_id])
                                          if paper_id in transgene_ids_in_documents else [], "tfp_transgene")
        papers_passwd[paper_id] = time.time()
        write_passwd(cur, paper_id, papers_passwd[paper_id])
        paper_title = get_paper_title(cur, paper_id)
        paper_journal = get_paper_journal(cur, paper_id)

        # notify author(s) via email
        if len(email_addr_in_papers_dict[paper_id]) > 0:

            url = "http://textpressocentral.org:5000?paper=" + paper_id + "&passwd=" + \
                  str(papers_passwd[paper_id]) + "&title=" + urllib.parse.quote(paper_title) + "&journal=" + \
                  urllib.parse.quote(paper_journal)
            send_email(paper_id, paper_title, paper_journal, url, ["valerio.arnaboldi@gmail.com"], args.email_passwd)
            write_email(cur, paper_id, ["valerio.arnaboldi@gmail.com"])
            #send_email(paper_title, paper_journal, url, email_addr_in_papers_dict[paper_id][0])
            #write_email(cur, paper_id, email_addr_in_papers_dict[paper_id])

    # commit and close connection to DB
    logger.info("Committing changes to DB")
    conn.commit()
    cur.close()
    conn.close()
    logger.info("Finished")


if __name__ == '__main__':
    main()
