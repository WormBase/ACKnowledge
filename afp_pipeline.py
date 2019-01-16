#!/usr/bin/env python3

import argparse
import os
import ssl
import time
import urllib.parse

from urllib.request import urlopen
from email_functions import send_email_to_author, send_summary_email_to_admin
from tpc_api_functions import *
from entity_extraction import *
from collections import defaultdict


TPC_PAPERS_PER_QUERY = 10


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str)
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-p", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
    parser.add_argument("-t", "--textpresso-token", metavar="Textpresso API token", dest="textpresso_token", type=str)
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

    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    logger = logging.getLogger("AFP Pipeline")

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

    #TODO remove this line
    curatable_papers_not_processed_svm_flagged = ["00050093", "00053123", "00054889", "00054967", "00053873",
                                                  "00053739", "00054192", "00049183"]
    #curatable_papers_not_processed_svm_flagged = ["00054192"]

    # 6. Get fulltext for papers obtained in 5. from Textpresso
    logger.info("Getting papers fulltext")
    fulltexts_dict = {}
    email_addr_in_papers_dict = defaultdict(list)
    # process N papers for each Tpc call and continue until the number of papers with fulltext is >= n
    while len(fulltexts_dict) < args.num_papers and len(curatable_papers_not_processed_svm_flagged) > 0:
        paper_to_process = curatable_papers_not_processed_svm_flagged.pop(0)
        logger.debug("Extracting fulltext for paper " + paper_to_process)
        paper_fulltext = get_fulltext_from_pdfs(db_manager.get_paper_pdf_paths(paper_id=paper_to_process))
        if paper_fulltext != "":
            fulltexts_dict[paper_to_process] = paper_fulltext
            logger.info("Extracting email address from paper")
            email_addr_in_papers_dict[paper_to_process] = get_first_valid_email_address_from_paper(
                fulltexts_dict[paper_to_process], db_manager=db_manager)
            if not email_addr_in_papers_dict[paper_to_process]:
                logger.info("Removing paper with no email address")
                del fulltexts_dict[paper_to_process]

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

        # notify author(s) via email
        if email_addr_in_papers_dict[paper_id]:
            url = args.afp_base_url + "?paper=" + paper_id + "&passwd=" + \
                  str(papers_passwd[paper_id]) + "&title=" + urllib.parse.quote(paper_title) + "&journal=" + \
                  urllib.parse.quote(paper_journal) + "&pmid=" + pmid + "&personid=" + \
                  email_addr_in_papers_dict[paper_id][0].replace("two", "")
            urls.append(url)
            data = urlopen("http://tinyurl.com/api-create.php?url=" + url)
            tiny_url = data.read().decode('utf-8')
            tinyurls.append(tiny_url)
            send_email_to_author(paper_id, paper_title, paper_journal, tiny_url, args.admin_emails,
                                 args.email_passwd)
            db_manager.set_email(paper_id, ["valerio.arnaboldi@gmail.com"])
            #send_email_to_author(paper_id, paper_title, paper_journal, tiny_url, email_addr_in_papers_dict[paper_id][1])
            #db_manager.set_email(paper_id, email_addr_in_papers_dict[paper_id])

    # commit and close connection to DB
    logger.info("Committing changes to DB")
    db_manager.close()
    send_summary_email_to_admin(urls=tinyurls, paper_ids=list(fulltexts_dict.keys()),
                                recipients=args.admin_emails,
                                email_passwd=args.email_passwd)
    logger.info("Finished")


if __name__ == '__main__':
    main()
