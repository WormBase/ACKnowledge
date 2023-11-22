#!/usr/bin/env python3
import json
import logging

import joblib
import sent2vec
import falcon
import os

from wsgiref import simple_server
from falcon import HTTPStatus


logger = logging.getLogger(__name__)


class HandleCORS(object):
    def process_request(self, req, resp):
        allow_headers = req.get_header(
            'Access-Control-Request-Headers',
            default='*'
        )
        resp.set_header('Access-Control-Allow-Origin', '*')
        resp.set_header('Access-Control-Allow-Methods', '*')
        resp.set_header('Access-Control-Allow-Headers', allow_headers)
        resp.set_header('Access-Control-Max-Age', 1728000)  # 20 days
        if req.method == 'OPTIONS':
            raise HTTPStatus(falcon.HTTP_200, body='\n')


class SentenceClassificationReader:

    def __init__(self):
        self.sentence_classifiers = self.load_sentence_classifiers("/var/sentence_classification_models/")
        self.sent2vec_model = self.load_sent2vec_model("/var/sentence_classification_models/biosentvec.bin")

    @staticmethod
    def load_sent2vec_model(sent2vec_model_path):
        logger.info("Loading sentence embedding model...")
        biosentvec_model = sent2vec.Sent2vecModel()
        try:
            biosentvec_model.load_model(sent2vec_model_path)
        except Exception as e:
            logger.error(e)
        logger.info("Sentence embedding model loaded")
        return biosentvec_model

    @staticmethod
    def load_sentence_classifiers(models_path):
        logger.info("Loading sentence classifiers...")
        sentence_classifier_all_info_expression = joblib.load(f"{models_path}/all_info_expression.joblib")
        sentence_classifier_curatable_expression = joblib.load(f"{models_path}/curatable_expression.joblib")
        sentence_classifier_language_expression = joblib.load(f"{models_path}/language_expression.joblib")
        sentence_classifier_all_info_kinase = joblib.load(f"{models_path}/all_info_kinase.joblib")
        sentence_classifier_curatable_kinase = joblib.load(f"{models_path}/curatable_kinase.joblib")
        sentence_classifier_language_kinase = joblib.load(f"{models_path}/language_kinase.joblib")
        logger.info("All sentence classifiers loaded")
        return {
            "expression": {
                "all_info": sentence_classifier_all_info_expression,
                "curatable": sentence_classifier_curatable_expression,
                "language": sentence_classifier_language_expression
            },
            "kinase": {
                "all_info": sentence_classifier_all_info_kinase,
                "curatable": sentence_classifier_curatable_kinase,
                "language": sentence_classifier_language_kinase
            }
        }

    def on_post(self, req, resp, req_type):
        if req_type != "classify_sentences" or "sentences" not in req.media:
            raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
        sentence_embeddings = self.sent2vec_model.embed_sentences(req.media["sentences"])
        classes_all_info_expression = self.sentence_classifiers["expression"]["all_info"].predict(sentence_embeddings)
        classes_curatable_expression = self.sentence_classifiers["expression"]["curatable"].predict(sentence_embeddings)
        classes_language_expression = self.sentence_classifiers["expression"]["language"].predict(sentence_embeddings)
        classes_all_info_kinase = self.sentence_classifiers["kinase"]["all_info"].predict(sentence_embeddings)
        classes_curatable_kinase = self.sentence_classifiers["kinase"]["curatable"].predict(sentence_embeddings)
        classes_language_kinase = self.sentence_classifiers["kinase"]["language"].predict(sentence_embeddings)
        classes = {
            "expression": {
                "all_info": classes_all_info_expression.tolist(),
                "curatable": classes_curatable_expression.tolist(),
                "language": classes_language_expression.tolist()
            },
            "kinase": {
                "all_info": classes_all_info_kinase.tolist(),
                "curatable": classes_curatable_kinase.tolist(),
                "language": classes_language_kinase.tolist()
            }
        }
        resp.body = f'{{"classes": {json.dumps(classes)}}}'
        resp.status = falcon.HTTP_200


def main():
    logging.basicConfig(level='INFO', format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')
    app = falcon.App(middleware=[HandleCORS()])
    sentence_classification_reader = SentenceClassificationReader()
    app.add_route('/api/sentence_classification/{req_type}', sentence_classification_reader)

    httpd = simple_server.make_server('0.0.0.0', int(8002), app)
    httpd.serve_forever()


main()
