#!/usr/bin/env python3
import json
import logging
from wsgiref import simple_server

import falcon
from falcon import HTTPStatus
from transformers import AutoModelForSequenceClassification, TextClassificationPipeline, AutoTokenizer
from datasets import Dataset

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

    def process_response(self, req, resp, resource, req_succeeded):
        resp.set_header('Cache-Control', 'no-store')


class SentenceClassificationReader:

    def __init__(self):
        self.sentence_classifiers = self.load_sentence_classifiers("/var/sentence_classification_models/")
        self.sentence_tokenizers = self.load_tokenizers("/var/sentence_classification_models/")

    @staticmethod
    def load_tokenizers(tokenizers_path):
        logger.info("Loading tokenizers...")
        sentence_tokenizer_all_info_expression = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/model_biobert_expression/fully_curatable", use_fast=True)
        sentence_tokenizer_curatable_expression = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/model_biobert_expression/partially_curatable", use_fast=True)
        sentence_tokenizer_language_expression = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/model_biobert_expression/language_related", use_fast=True)
        sentence_tokenizer_all_info_kinase = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/model_biobert_kinaseact/fully_curatable", use_fast=True)
        sentence_tokenizer_curatable_kinase = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/model_biobert_kinaseact/partially_curatable", use_fast=True)
        sentence_tokenizer_language_kinase = AutoTokenizer.from_pretrained(
            f"{tokenizers_path}/model_biobert_kinaseact/language_related", use_fast=True)
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
        sentence_classifier_all_info_expression = AutoModelForSequenceClassification.from_pretrained(
            f"{models_path}/model_biobert_expression/fully_curatable").to_bettertransformer()
        sentence_classifier_curatable_expression = AutoModelForSequenceClassification.from_pretrained(
            f"{models_path}/model_biobert_expression/partially_curatable").to_bettertransformer()
        sentence_classifier_language_expression = AutoModelForSequenceClassification.from_pretrained(
            f"{models_path}/model_biobert_expression/language_related").to_bettertransformer()
        sentence_classifier_all_info_kinase = AutoModelForSequenceClassification.from_pretrained(
            f"{models_path}/model_biobert_kinaseact/fully_curatable").to_bettertransformer()
        sentence_classifier_curatable_kinase = AutoModelForSequenceClassification.from_pretrained(
            f"{models_path}/model_biobert_kinaseact/partially_curatable").to_bettertransformer()
        sentence_classifier_language_kinase = AutoModelForSequenceClassification.from_pretrained(
            f"{models_path}/model_biobert_kinaseact/language_related").to_bettertransformer()
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
        logger.info("started sentences classification...")
        dataset = Dataset.from_dict({"text": req.media["sentences"]})
        classes_all_info_expression = [int(classification["label"] == "LABEL_1") for classification in
                                       TextClassificationPipeline(
                                           model=self.sentence_classifiers["expression"]["all_info"],
                                           tokenizer=self.sentence_tokenizers["expression"]["all_info"])(
                                           dataset["text"], batch_size=32)]
        classes_curatable_expression = [int(classification["label"] == "LABEL_1") for classification in
                                        TextClassificationPipeline(
                                            model=self.sentence_classifiers["expression"]["curatable"],
                                            tokenizer=self.sentence_tokenizers["expression"]["curatable"])(
                                           dataset["text"], batch_size=32)]
        classes_language_expression = [int(classification["label"] == "LABEL_1") for classification in
                                       TextClassificationPipeline(
                                           model=self.sentence_classifiers["expression"]["language"],
                                           tokenizer=self.sentence_tokenizers["expression"]["language"])(
                                           dataset["text"], batch_size=32)]
        classes_all_info_kinase = [int(classification["label"] == "LABEL_1") for classification in
                                   TextClassificationPipeline(
                                       model=self.sentence_classifiers["kinase"]["all_info"],
                                       tokenizer=self.sentence_tokenizers["kinase"]["all_info"])(
                                       dataset["text"], batch_size=32)]
        classes_curatable_kinase = [int(classification["label"] == "LABEL_1") for classification in
                                    TextClassificationPipeline(
                                        model=self.sentence_classifiers["kinase"]["curatable"],
                                        tokenizer=self.sentence_tokenizers["kinase"]["curatable"])(
                                        dataset["text"], batch_size=32)]
        classes_language_kinase = [int(classification["label"] == "LABEL_1") for classification in
                                   TextClassificationPipeline(
                                       model=self.sentence_classifiers["kinase"]["language"],
                                       tokenizer=self.sentence_tokenizers["kinase"]["language"])(
                                       dataset["text"], batch_size=32)]
        logger.info("finished sentences classification.")
        classes = {
            "expression": {
                "all_info": classes_all_info_expression,
                "curatable": classes_curatable_expression,
                "language": classes_language_expression
            },
            "kinase": {
                "all_info": classes_all_info_kinase,
                "curatable": classes_curatable_kinase,
                "language": classes_language_kinase
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
