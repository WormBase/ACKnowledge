#!/usr/bin/env python3

import argparse
import json
import logging
import os
import ssl
import urllib.request


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

    paper_id = "WBPaper00050052"
    category = "Gene (C. elegans) (tpgce:0000001)"

    if not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
        ssl._create_default_https_context = ssl._create_unverified_context
    api_endpoint = "https://textpressocentral.org:18080/v1/textpresso/api/get_category_matches_document_fulltext"
    data = json.dumps({"token": args.textpresso_token, "query": {
        "accession": paper_id, "type": "document", "corpora": ["C. elegans"]}, "category": category})
    data = data.encode('utf-8')
    req = urllib.request.Request(api_endpoint, data, headers={'Content-type': 'application/json',
                                                              'Accept': 'application/json'})
    res = urllib.request.urlopen(req)
    genes_in_paper = json.loads(res.read().decode('utf-8'))[0]["matches"]

    print(genes_in_paper)


if __name__ == '__main__':
    main()
