#!/usr/bin/env python3
import json
import logging
from wsgiref import simple_server

import falcon
from falcon import HTTPStatus
from transformers import AutoModelForSequenceClassification, TextClassificationPipeline, AutoTokenizer

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
        self.sentence_tokenizers = self.load_tokenizers("/var/sentence_classification_models/")

    @staticmethod
    def load_tokenizers(tokenizers_path):
        logger.info("Loading tokenizers...")
        sentence_tokenizer_all_info_expression = AutoTokenizer.from_pretrained(f"{tokenizers_path}/all_info_expression")
        sentence_tokenizer_curatable_expression = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/curatable_expression.joblib")
        sentence_tokenizer_language_expression = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/language_expression.joblib")
        sentence_tokenizer_all_info_kinase = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/all_info_kinase.joblib")
        sentence_tokenizer_curatable_kinase = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/curatable_kinase.joblib")
        sentence_tokenizer_language_kinase = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/language_kinase.joblib")
        logger.info("All sentence classifiers loaded")
        return {
            "expression": {
                "all_info": sentence_tokenizer_all_info_expression,
                "curatable": sentence_tokenizer_curatable_expression,
                "language": sentence_tokenizer_language_expression
            },
            "kinase": {
                "all_info": sentence_tokenizer_all_info_kinase,
                "curatable": sentence_tokenizer_curatable_kinase,
                "language": sentence_tokenizer_language_kinase
            }
        }

    @staticmethod
    def load_sentence_classifiers(models_path):
        logger.info("Loading sentence classifiers...")
        sentence_classifier_all_info_expression = AutoModelForSequenceClassification.from_pretrained(f"{models_path}/all_info_expression")
        sentence_classifier_curatable_expression = AutoModelForSequenceClassification.from_pretrained(f"{models_path}/curatable_expression.joblib")
        sentence_classifier_language_expression = AutoModelForSequenceClassification.from_pretrained(f"{models_path}/language_expression.joblib")
        sentence_classifier_all_info_kinase = AutoModelForSequenceClassification.from_pretrained(f"{models_path}/all_info_kinase.joblib")
        sentence_classifier_curatable_kinase = AutoModelForSequenceClassification.from_pretrained(f"{models_path}/curatable_kinase.joblib")
        sentence_classifier_language_kinase = AutoModelForSequenceClassification.from_pretrained(f"{models_path}/language_kinase.joblib")
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
        classes_all_info_expression = TextClassificationPipeline(
            model=self.sentence_classifiers["expression"]["all_info"],
            tokenizer=self.sentence_tokenizers["expression"]["all_info"])(req["media"]["sentences"])
        classes_curatable_expression = TextClassificationPipeline(
            model=self.sentence_classifiers["expression"]["curatable"],
            tokenizer=self.sentence_tokenizers["expression"]["curatable"])(req["media"]["sentences"])
        classes_language_expression = TextClassificationPipeline(
            model=self.sentence_classifiers["expression"]["language"],
            tokenizer=self.sentence_tokenizers["expression"]["language"])(req["media"]["sentences"])
        classes_all_info_kinase = TextClassificationPipeline(
            model=self.sentence_classifiers["kinase"]["all_info"],
            tokenizer=self.sentence_tokenizers["kinase"]["all_info"])(req["media"]["sentences"])
        classes_curatable_kinase = TextClassificationPipeline(
            model=self.sentence_classifiers["kinase"]["curatable"],
            tokenizer=self.sentence_tokenizers["kinase"]["curatable"])(req["media"]["sentences"])
        classes_language_kinase = TextClassificationPipeline(
            model=self.sentence_classifiers["kinase"]["language"],
            tokenizer=self.sentence_tokenizers["kinase"]["language"])(req["media"]["sentences"])
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
