import json
import urllib.request
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
        "accession": " ".join(paper_ids),
        "type": "document", "corpora": ["C. elegans"]}, "include_fulltext": True})
    data = data.encode('utf-8')
    req = urllib.request.Request(api_endpoint, data, headers={'Content-type': 'application/json',
                                                              'Accept': 'application/json'})
    res = urllib.request.urlopen(req)
    return {doc["identifier"].split("/")[1][7:]: doc["abstract"] + doc["fulltext"] for doc in
            json.loads(res.read().decode('utf-8'))}


def get_category_keywords_in_documents(api_token, paper_ids, category):
    api_endpoint = "https://textpressocentral.org:18080/v1/textpresso/api/get_category_matches_document_fulltext"
    data = json.dumps({"token": api_token, "query": {
        "accession": " ".join(paper_ids), "type": "document", "corpora": ["C. elegans"]}, "category": category})
    data = data.encode('utf-8')
    req = urllib.request.Request(api_endpoint, data, headers={'Content-type': 'application/json',
                                                              'Accept': 'application/json'})
    res = urllib.request.urlopen(req)
    return {doc["identifier"].split("/")[1][7:]: doc["matches"] if "matches" in doc else [] for doc in
            json.loads(res.read().decode('utf-8'))}
