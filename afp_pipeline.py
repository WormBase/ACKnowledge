#!/usr/bin/env python3

import argparse
import logging
import os
import re
import ssl
import psycopg2

from db_functions import get_list_of_curatable_papers, get_list_of_emailed_papers, get_svm_flagged_papers, \
    get_all_strains, _describe_table, get_all_transgenes
from tpc_api_functions import get_documents_fulltext, get_category_keywords_in_documents
from vocabulary_extraction_functions import get_matches_in_fulltext, get_species_in_fulltext_from_regex
from collections import defaultdict


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-t", "--textpresso-token", metavar="Textpresso API token", dest="textpresso_token", type=str,
                        default="config.yml", help="configuration file. Default ./config.yaml")
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str,
                        default="afp_pipeline.log",
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], help="set the logging level")

    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level)

    conn = psycopg2.connect("dbname='testdb' user='valerio' password='asdf1234' host='131.215.52.92'")
    cur = conn.cursor()

    # 1. Get list of curatable papers
    curatable_papers = get_list_of_curatable_papers(cur)

    # 2. Get list of papers that have been already emailed
    emailed_papers = get_list_of_emailed_papers(cur)

    # 3. Calculate difference between 1. and 2.
    curatable_papers_not_emailed = set().difference(curatable_papers, emailed_papers)

    # 4. Get list of SVM flagged papers
    papers_svm_flags = get_svm_flagged_papers(cur)

    # 5. Calculate intersection between 3. and 4.
    curatable_papers_not_emailed_svm_flagged = set().intersection(curatable_papers_not_emailed,
                                                                  list(papers_svm_flags.keys()))

    # disable ssl key verification
    if not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
        ssl._create_default_https_context = ssl._create_unverified_context

    # 6. Get fulltext for papers obtained in 5. from Textpresso
    paper_ids = ["WBPaper" + paper_id for paper_id in curatable_papers_not_emailed_svm_flagged]
    # TODO: this is a debug line, remove it when ready for production
    paper_ids = ["WBPaper00050052", "WBPaper00002892"]
    fulltexts_dict = get_documents_fulltext(args.textpresso_token, paper_ids)

    # 7. Get the list of genes, alleles, strains etc from fulltext
    paper_ids = ["WBPaper" + paper_id for paper_id in list(fulltexts_dict.keys())]
    genes_in_documents = get_category_keywords_in_documents(args.textpresso_token, paper_ids,
                                                            "Gene (C. elegans) (tpgce:0000001)")
    alleles_in_documents = get_category_keywords_in_documents(args.textpresso_token, paper_ids,
                                                              "allele (C. elegans) (tpalce:0000001)")
    strains_vocabulary = set(get_all_strains(cur))
    transgene_vocabulary = set(get_all_transgenes(cur))
    strains_in_papers_dict = defaultdict(list)
    transgenes_in_papers_dict = defaultdict(list)
    species_in_papers_dict = defaultdict(list)
    email_addr_in_papers_dict = defaultdict(list)

    for paper_id, fulltext in fulltexts_dict.items():
        get_matches_in_fulltext(fulltext, strains_vocabulary, strains_in_papers_dict, paper_id)
        get_matches_in_fulltext(fulltext, transgene_vocabulary, transgenes_in_papers_dict, paper_id)
        get_species_in_fulltext_from_regex(fulltext, species_in_papers_dict, paper_id)
        email_addr_in_papers_dict[paper_id] = re.findall(r'[\w\.-]+@[\w\.-]+', fulltext)


if __name__ == '__main__':
    main()
