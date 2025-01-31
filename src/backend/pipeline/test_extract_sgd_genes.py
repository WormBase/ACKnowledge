#!/usr/bin/env python3

import argparse
import logging
import csv

from wbtools.db.dbmanager import WBDBManager
from wbtools.lib.nlp.common import EntityType
from wbtools.lib.nlp.entity_extraction.ntt_extractor import NttExtractor
from wbtools.literature.corpus import CorpusManager
from wbtools.lib.nlp.literature_index.textpresso import TextpressoLiteratureIndex

from src.backend.common.config import load_config_from_file

logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Test pipeline to extract SGD gene names from WBPaper fulltext")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./test_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'], default="INFO",
                        help="set the logging level")
    parser.add_argument("-t", "--textpresso-apitoken", metavar="tpc_token", dest="tpc_token", type=str)
    parser.add_argument("-i", "--paper-ids", metavar="paper_ids", dest="paper_ids", type=str, nargs="+",
                        help="list of WBPaper IDs to process")
    parser.add_argument("-o", "--output-csv", metavar="output_csv", dest="output_csv", type=str, required=True,
                        help="path to the output CSV file")
    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')
    config = load_config_from_file()

    db_manager = WBDBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    ntt_extractor = NttExtractor(db_manager=db_manager.generic)
    textpresso_lit_index = TextpressoLiteratureIndex(
        api_url="https://www.alliancegenome.org/textpresso/sgd/v1/textpresso/api/", use_cache=True,
        corpora=["S. cerevisiae"], api_token=args.tpc_token)
    cm = CorpusManager()

    cm.load_from_wb_database(
        args.db_name, args.db_user, args.db_password, args.db_host,
        paper_ids=args.paper_ids)

    sgd_gene_names = ntt_extractor.get_alliance_curated_entities(entity_type=EntityType.GENE, mod_abbreviation="SGD")

    with open(args.output_csv, mode='w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(["paper_id", "genes_extracted"])

        for paper in cm.get_all_papers():
            logging.info("processing paper " + str(paper.paper_id))
            fulltext = paper.get_text_docs(include_supplemental=True, tokenize=False, return_concatenated=True)
            fulltext = fulltext.replace('\n', ' ')
            paper.abstract = paper.abstract if paper.abstract else ""
            paper.title = paper.title if paper.title else ""
            title_abs = paper.title + " " + paper.abstract

            logger.info("Extracting SGD gene names")
            meaningful_sgd_genes_fulltext = ntt_extractor.extract_meaningful_entities_by_keywords(
                keywords=sgd_gene_names,
                text=fulltext,
                lit_index=textpresso_lit_index,
                match_uppercase=True,
                min_matches=config["ntt_extraction"]["min_occurrences"]["gene"],
                tfidf_threshold=config["ntt_extraction"]["min_tfidf"]["gene"])

            meaningful_sgd_genes_title_abstract = ntt_extractor.extract_meaningful_entities_by_keywords(
                keywords=sgd_gene_names,
                text=title_abs,
                match_uppercase=True)

            meaningful_sgd_genes = list(set(meaningful_sgd_genes_fulltext) | set(meaningful_sgd_genes_title_abstract))

            csv_writer.writerow([paper.paper_id, ", ".join(meaningful_sgd_genes)])

    logger.info("Test pipeline finished successfully")


if __name__ == '__main__':
    main()
