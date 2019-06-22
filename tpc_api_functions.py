import json
import urllib.request
from collections import defaultdict
from typing import List


def get_documents_fulltext(api_token: str, paper_ids: List[str]):
    """
    get the fulltext of the specified documents
    :param api_token: a valid textpresso API token, with permissions to read the fulltext of papers
    :param paper_ids: a list of valid WBPaper ids
    :return (Dict[str, str]): a dictionary with paper ids as key and their abstrat + fulltext as value
    """
    api_endpoint = "https://textpressocentral.org:18080/v1/textpresso/api/search_documents"
    data = json.dumps({"token": api_token, "query": {
        "keywords": "reviewer AND comment",
        "type": "document", "corpora": ["C. elegans Supplementals"]}, "include_fulltext": False})
    data = data.encode('utf-8')
    req = urllib.request.Request(api_endpoint, data, headers={'Content-type': 'application/json',
                                                              'Accept': 'application/json'})
    res = urllib.request.urlopen(req)
    res_json = json.loads(res.read().decode('utf-8'))
    doc_ids_to_exclude = []
    if res_json:
        doc_ids_to_exclude = [doc["identifier"] for doc in res_json]
    data = json.dumps({"token": api_token, "query": {
        "accession": " ".join(paper_ids),
        "type": "document", "corpora": ["C. elegans", "C. elegans Supplementals"]}, "include_fulltext": True})
    data = data.encode('utf-8')
    req = urllib.request.Request(api_endpoint, data, headers={'Content-type': 'application/json',
                                                              'Accept': 'application/json'})
    res = urllib.request.urlopen(req)
    fulltexts = defaultdict(str)
    for doc in json.loads(res.read().decode('utf-8')):
        if doc["identifier"] not in doc_ids_to_exclude:
            if "Supplementals" in doc["identifier"]:
                fulltexts[doc["identifier"].split("/")[1][7:].split(".")[0]] += doc["fulltext"]
            else:
                fulltexts[doc["identifier"].split("/")[1][7:].split(".")[0]] += doc["abstract"] + doc["fulltext"]
    return fulltexts


def get_category_keywords_in_documents(api_token, paper_ids, category):
    api_endpoint = "https://textpressocentral.org:18080/v1/textpresso/api/get_category_matches_document_fulltext"
    data = json.dumps({"token": api_token, "query": {
        "accession": " ".join(paper_ids), "type": "document", "corpora": ["C. elegans", "C. elegans Supplementals"]},
                       "category": category})
    data = data.encode('utf-8')
    req = urllib.request.Request(api_endpoint, data, headers={'Content-type': 'application/json',
                                                              'Accept': 'application/json'})
    res = urllib.request.urlopen(req)
    categories = defaultdict(set)
    for doc in json.loads(res.read().decode('utf-8')):
        if "matches" in doc:
            categories[doc["identifier"].split("/")[1][7:].split(".")[0]] |= set(doc["matches"])
    return categories
