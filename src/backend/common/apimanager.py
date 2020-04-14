import json
import logging
import os
import ssl
import urllib.request

logger = logging.getLogger(__name__)


class APIManager(object):
    def __init__(self, textpresso_api_token):
        self.textpresso_api_token = textpresso_api_token
        self.tpc_cache = {}
        self.tpc_api_endpoint = "https://textpressocentral.org:18080/v1/textpresso/api/get_documents_count"
        if not os.environ.get('PYTHONHTTPSVERIFY', '') and getattr(ssl, '_create_unverified_context', None):
            ssl._create_default_https_context = ssl._create_unverified_context

    def get_doc_count(self, keyword: str):
        """get the number of papers in the C. elegans literature that mention a certain keyword (document counter)
           from Textpresso Central API

        Args:
            keyword (str): the keyword to search
        Returns:
            int: the document counter of the specified keyword
        """
        if keyword in self.tpc_cache:
            logger.debug("Popularity for keyword found in cache")
            return self.tpc_cache[keyword]
        else:
            data = json.dumps({"token": self.textpresso_api_token, "query": {
                "keywords": keyword, "type": "document", "corpora": ["C. elegans"]}})
            data = data.encode('utf-8')
            req = urllib.request.Request(self.tpc_api_endpoint, data, headers={'Content-type': 'application/json',
                                                                               'Accept': 'application/json'})
            res = urllib.request.urlopen(req)
            logger.debug("Sending request to Textpresso Central API")
            popularity = int(json.loads(res.read().decode('utf-8')))
            self.tpc_cache[keyword] = popularity
            return popularity
