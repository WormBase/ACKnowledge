import json
import os
import re

import requests
import numpy as np
import sent2vec
import falcon
import logging

from nltk import sent_tokenize
from wbtools.db.dbmanager import WBDBManager
from wbtools.lib.nlp.common import EntityType, PaperSections
from wbtools.literature.corpus import CorpusManager


logger = logging.getLogger(__name__)


MIN_CLASS_VAL = "medium"


class CuratorDashboardReader:

    def __init__(self, db_manager: WBDBManager, afp_base_url: str, tazendra_username, tazendra_password):
        self.db = db_manager
        self.afp_base_url = afp_base_url
        self.tazendra_username = tazendra_username
        self.tazendra_password = tazendra_password

    @staticmethod
    def transform_none_to_string(val):
        if val is None:
            return 'null'
        else:
            return val

    def get_all_lists(self, paper_id):
        tfp_genestudied = self.transform_none_to_string(self.db._get_single_field(paper_id, "tfp_genestudied"))
        afp_genestudied = self.transform_none_to_string(self.db._get_single_field(paper_id, "afp_genestudied"))
        tfp_species = self.transform_none_to_string(self.db._get_single_field(paper_id, "tfp_species"))
        afp_species = self.transform_none_to_string(self.db._get_single_field(paper_id, "afp_species"))
        tfp_alleles = self.transform_none_to_string(self.db._get_single_field(paper_id, "tfp_variation"))
        afp_alleles = self.transform_none_to_string(self.db._get_single_field(paper_id, "afp_variation"))
        tfp_strains = self.transform_none_to_string(self.db._get_single_field(paper_id, "tfp_strain"))
        afp_strains = self.transform_none_to_string(self.db._get_single_field(paper_id, "afp_strain"))
        tfp_transgenes = self.transform_none_to_string(self.db._get_single_field(paper_id, "tfp_transgene"))
        afp_transgenes = self.transform_none_to_string(self.db._get_single_field(paper_id, "afp_transgene"))
        return {"tfp_genestudied": tfp_genestudied, "afp_genestudied": afp_genestudied, "tfp_species": tfp_species,
                "afp_species": afp_species, "tfp_alleles": tfp_alleles, "afp_alleles": afp_alleles,
                "tfp_strains": tfp_strains, "afp_strains": afp_strains, "tfp_transgenes": tfp_transgenes,
                "afp_transgenes": afp_transgenes}

    def get_class_author_sub_val(self, table_name, paper_id):
        afp_val = self.db._get_single_field(paper_id, table_name)
        if afp_val is not None:
            afp_val_checked = afp_val != ""
            afp_val_details = afp_val if afp_val != "Checked" and afp_val != "checked" and afp_val != "" else ""
        else:
            afp_val_checked = 'null'
            afp_val_details = 'null'
        return afp_val_checked, afp_val_details


    def get_all_flagged_data_types(self, paper_id):
        classifications = self.db.paper.get_automated_classification_values(paper_id)
        svm_otherexpr = self.db.paper.is_paper_positive_for_class(automated_classification_values=classifications,
                                                                  cl="otherexpr", min_value=MIN_CLASS_VAL)
        afp_otherexpr_checked, afp_otherexpr_details = self.get_class_author_sub_val("afp_otherexpr", paper_id)
        svm_seqchange = self.db.paper.is_paper_positive_for_class(automated_classification_values=classifications,
                                                                  cl="seqchange", min_value=MIN_CLASS_VAL)
        afp_seqchange_checked, afp_seqchange_details = self.get_class_author_sub_val("afp_seqchange", paper_id)
        svm_geneint = self.db.paper.is_paper_positive_for_class(automated_classification_values=classifications,
                                                                cl="geneint", min_value=MIN_CLASS_VAL)
        afp_geneint_checked, afp_geneint_details = self.get_class_author_sub_val("afp_geneint", paper_id)
        svm_geneprod = self.db.paper.is_paper_positive_for_class(automated_classification_values=classifications,
                                                                 cl="geneprod", min_value=MIN_CLASS_VAL)
        afp_geneprod_checked, afp_geneprod_details = self.get_class_author_sub_val("afp_geneprod", paper_id)
        svm_genereg = self.db.paper.is_paper_positive_for_class(automated_classification_values=classifications,
                                                                cl="genereg", min_value=MIN_CLASS_VAL)
        afp_genereg_checked, afp_genereg_details = self.get_class_author_sub_val("afp_genereg", paper_id)
        svm_newmutant = self.db.paper.is_paper_positive_for_class(automated_classification_values=classifications,
                                                                  cl="newmutant", min_value=MIN_CLASS_VAL)
        afp_newmutant_checked, afp_newmutant_details = self.get_class_author_sub_val("afp_newmutant", paper_id)
        svm_rnai = self.db.paper.is_paper_positive_for_class(automated_classification_values=classifications,
                                                             cl="rnai", min_value=MIN_CLASS_VAL)
        afp_rnai_checked, afp_rnai_details = self.get_class_author_sub_val("afp_rnai", paper_id)
        svm_overexpr = self.db.paper.is_paper_positive_for_class(automated_classification_values=classifications,
                                                                 cl="overexpr", min_value=MIN_CLASS_VAL)
        afp_overexpr_checked, afp_overexpr_details = self.get_class_author_sub_val("afp_overexpr", paper_id)
        svm_catalyticact = self.db.paper.is_paper_positive_for_class(automated_classification_values=classifications,
                                                                     cl="catalyticact", min_value=MIN_CLASS_VAL)
        afp_catalyticact_checked, afp_catalyticact_details = self.get_class_author_sub_val("afp_catalyticact", paper_id)
        return {"svm_otherexpr_checked": svm_otherexpr, "afp_otherexpr_checked": afp_otherexpr_checked,
                "afp_otherexpr_details": afp_otherexpr_details,
                "svm_seqchange_checked": svm_seqchange, "afp_seqchange_checked": afp_seqchange_checked,
                "afp_seqchange_details": afp_seqchange_details, "svm_geneint_checked": svm_geneint,
                "afp_geneint_checked": afp_geneint_checked, "afp_geneint_details": afp_geneint_details,
                "svm_geneprod_checked": svm_geneprod, "afp_geneprod_checked": afp_geneprod_checked,
                "afp_geneprod_details": afp_geneprod_details, "svm_genereg_checked": svm_genereg,
                "afp_genereg_checked": afp_genereg_checked, "afp_genereg_details": afp_genereg_details,
                "svm_newmutant_checked": svm_newmutant, "afp_newmutant_checked": afp_newmutant_checked,
                "afp_newmutant_details": afp_newmutant_details, "svm_rnai_checked": svm_rnai,
                "afp_rnai_checked": afp_rnai_checked, "afp_rnai_details": afp_rnai_details,
                "svm_overexpr_checked": svm_overexpr, "afp_overexpr_checked": afp_overexpr_checked,
                "afp_overexpr_details": afp_overexpr_details,
                "svm_catalyticact_checked": svm_catalyticact, "afp_catalyticact_checked": afp_catalyticact_checked,
                "afp_catalyticact_details": afp_catalyticact_details}

    def get_all_yes_no_data_types(self, paper_id):
        afp_modchange_checked, afp_modchange_details = self.get_class_author_sub_val("afp_structcorr", paper_id)
        afp_newantibody_checked, afp_newantibody_details = self.get_class_author_sub_val("afp_antibody", paper_id)
        afp_siteaction_checked, afp_siteaction_details = self.get_class_author_sub_val("afp_siteaction", paper_id)
        afp_timeaction_checked, afp_timeaction_details = self.get_class_author_sub_val("afp_timeaction", paper_id)
        afp_rnaseq_checked, afp_rnaseq_details = self.get_class_author_sub_val("afp_rnaseq", paper_id)
        afp_chemphen_checked, afp_chemphen_details = self.get_class_author_sub_val("afp_chemphen", paper_id)
        afp_envpheno_checked, afp_envpheno_details = self.get_class_author_sub_val("afp_envpheno", paper_id)
        afp_catalyticact_checked, afp_catalyticact_details = self.get_class_author_sub_val("afp_catalyticact", paper_id)
        afp_humdis_checked, afp_humdis_details = self.get_class_author_sub_val("afp_humdis", paper_id)
        afp_additionalexpr = self.db._get_single_field(paper_id, "afp_additionalexpr")
        if afp_additionalexpr == 'null':
            afp_additionalexpr = ''
        afp_othergenefunc_checked, afp_othergenefunc_details = self.get_class_author_sub_val("afp_othergenefunc", paper_id)
        return {"afp_modchange_checked": afp_modchange_checked, "afp_modchange_details": afp_modchange_details,
                "afp_newantibody_checked": afp_newantibody_checked, "afp_newantibody_details": afp_newantibody_details,
                "afp_siteaction_checked": afp_siteaction_checked, "afp_siteaction_details": afp_siteaction_details,
                "afp_timeaction_checked": afp_timeaction_checked, "afp_timeaction_details": afp_timeaction_details,
                "afp_rnaseq_checked": afp_rnaseq_checked, "afp_rnaseq_details": afp_rnaseq_details,
                "afp_chemphen_checked": afp_chemphen_checked, "afp_chemphen_details": afp_chemphen_details,
                "afp_envpheno_checked": afp_envpheno_checked, "afp_envpheno_details": afp_envpheno_details,
                "afp_catalyticact_checked": afp_catalyticact_checked, "afp_catalyticact_details":
                    afp_catalyticact_details,
                "afp_humdis_checked": afp_humdis_checked, "afp_humdis_details": afp_humdis_details,
                "afp_additionalexpr": afp_additionalexpr, "afp_othergenefunc_checked": afp_othergenefunc_checked,
                "afp_othergenefunc_details": afp_othergenefunc_details}

    def get_other_data_types(self, paper_id):
        othervariations = self.db._get_single_field(paper_id, "afp_othervariation")
        afp_newalleles = " | ".join([elem['name'] for elem in json.loads(othervariations)]) if \
            othervariations and othervariations != 'null' else ""
        otherstrains = self.db._get_single_field(paper_id, "afp_otherstrain")
        afp_newstrains = " | ".join([elem['name'] for elem in json.loads(otherstrains)]) if \
            otherstrains and otherstrains != 'null' else ""
        othertransgenes = self.db._get_single_field(paper_id, "afp_othertransgene")
        afp_newtransgenes = " | ".join([elem['name'] for elem in json.loads(othertransgenes)]) if \
            othertransgenes and othertransgenes != 'null' else ""
        otherantibodies = self.db._get_single_field(paper_id, "afp_otherantibody")
        afp_otherantibodies = " | ".join([elem['name'] for elem in
                                          json.loads(otherantibodies) if
                                          elem["name"] != ""]) if otherantibodies and otherantibodies != 'null' else ""
        return {"afp_newalleles": afp_newalleles, "afp_newstrains": afp_newstrains,
                "afp_newtransgenes": afp_newtransgenes, "afp_otherantibodies": afp_otherantibodies}

    def get_text_from_pdfs(self, paper_id):
        cm = CorpusManager()
        cm.load_from_wb_database(
            self.db.db_name, self.db.user, self.db.password, self.db.host,
            must_be_autclass_flagged=True, exclude_no_main_text=True,
            exclude_no_author_email=True, exclude_temp_pdf=True, paper_ids=[paper_id])
        paper = cm.get_paper(paper_id)
        fulltext = paper.get_text_docs(include_supplemental=True, tokenize=False, return_concatenated=True,
                                       remove_sections=[PaperSections.RELATED_WORK,
                                                        PaperSections.ACKNOWLEDGEMENTS,
                                                        PaperSections.REFERENCES],
                                       must_be_present=[PaperSections.RESULTS])
        fulltext = fulltext.replace("Fig.", "Fig")
        fulltext = fulltext.replace("et al.", "et al")
        fulltext = fulltext.replace('.\n\n', '. ')
        fulltext = fulltext.replace('\n\n', '. ')
        fulltext = fulltext.replace('-\n', '')
        fulltext = fulltext.replace('.\n', '. ')
        fulltext = fulltext.replace('\n', ' ')
        sentences = sent_tokenize(fulltext)
        sentences = [sent for sent in sentences if np.average([len(w) for w in sent.split(' ')]) > 2]
        fulltext = fulltext.replace('\n', ' ')
        fulltext = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', fulltext)
        sentences = [sentence.replace('\n', ' ') for sentence in sentences]
        sentences = [re.sub(r'[\x00-\x1F\x7F-\x9F]', '', sentence) for sentence in sentences]
        sentences = [sentence for sentence in sentences if len(sentence) > 20 and len(sentence.split(" ")) > 2]
        paper.abstract = paper.abstract if paper.abstract else ""
        paper.title = paper.title if paper.title else ""
        res = requests.post(f"{os.environ['SENTENCE_CLASSIFICATION_API']}/api/sentence_classification/"
                            f"classify_sentences",
                            {"sentences": sentences})
        return fulltext, sentences, json.dumps(res.json()["classes"])

    def on_post(self, req, resp, req_type):
        with self.db:
            if req_type != "stats_totals" and req_type != "papers" and req_type != "contributors" \
                    and req_type != "most_emailed" and req_type != "all_papers" and req_type != "entities_count" and \
                    req_type != "paper_stats" and req_type != "stats_timeseries":
                if "paper_id" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                paper_id = req.media["paper_id"]
                if req_type == "status":
                    afp_processed = self.db.afp.paper_is_afp_processed(paper_id)
                    afp_processed_date = self.db.afp.get_processed_date(paper_id)
                    author_submitted = self.db.afp.author_has_submitted(paper_id)
                    author_modified = self.db.afp.author_has_modified(paper_id)
                    afp_form_link = self.db.afp.get_afp_form_link(paper_id, self.afp_base_url)
                    title = self.db.paper.get_paper_title(paper_id)
                    journal = self.db.paper.get_paper_journal(paper_id)
                    email = self.db.afp.get_contact_emails(paper_id)
                    pmid = self.db.paper.get_pmid(paper_id)
                    doi = self.db.paper.get_doi(paper_id)
                    resp.body = '{{"title": "{}", "journal": "{}", "email": "{}", "afp_processed": {}, ' \
                                '"author_submitted": {}, "author_modified": {}, "afp_form_link": "{}", "pmid": "{}", ' \
                                '"doi": "{}", "afp_processed_date": "{}"}}'.format(
                        title, journal, email,
                        "true" if afp_processed else "false", "true" if author_submitted else "false", "true" if
                        author_modified else "false", afp_form_link, pmid, doi, afp_processed_date)
                    resp.status = falcon.HTTP_200
                elif req_type == "lists":
                    lists_dict = self.get_all_lists(paper_id)
                    resp.body = '{{"tfp_genestudied": "{}", "afp_genestudied": "{}", "tfp_species": "{}", "afp_species": ' \
                                '"{}", "tfp_alleles": "{}", "afp_alleles": "{}", "tfp_strains": "{}", "afp_strains": ' \
                                '"{}", "tfp_transgenes": "{}", "afp_transgenes": "{}"}}'.format(
                        lists_dict["tfp_genestudied"], lists_dict["afp_genestudied"], lists_dict["tfp_species"],
                        lists_dict["afp_species"], lists_dict["tfp_alleles"], lists_dict["afp_alleles"],
                        lists_dict["tfp_strains"], lists_dict["afp_strains"], lists_dict["tfp_transgenes"],
                        lists_dict["afp_transgenes"])
                    resp.status = falcon.HTTP_200
                elif req_type == "flagged":
                    flagged_dict = self.get_all_flagged_data_types(paper_id)
                    resp.body = '{{"svm_otherexpr_checked": "{}", "afp_otherexpr_checked": "{}", ' \
                                '"afp_otherexpr_details": {}, "svm_seqchange_checked": "{}", ' \
                                '"afp_seqchange_checked": "{}", ' \
                                '"afp_seqchange_details": {}, "svm_geneint_checked": "{}", ' \
                                '"afp_geneint_checked": "{}", "afp_geneint_details": {}, ' \
                                '"svm_geneprod_checked": "{}", "afp_geneprod_checked": "{}" ,' \
                                '"afp_geneprod_details": {}, "svm_genereg_checked": "{}",' \
                                '"afp_genereg_checked": "{}", "afp_genereg_details": {}, ' \
                                '"svm_newmutant_checked": "{}", "afp_newmutant_checked": "{}", ' \
                                '"afp_newmutant_details": {}, "svm_rnai_checked": "{}",' \
                                ' "afp_rnai_checked": "{}", "afp_rnai_details": {}, ' \
                                '"svm_catalyticact_checked": "{}", "afp_catalyticact_checked": "{}", ' \
                                '"afp_catalyticact_details": {}, ' \
                                '"svm_overexpr_checked": "{}", "afp_overexpr_checked": "{}", ' \
                                '"afp_overexpr_details": {}}}'.format(
                        flagged_dict["svm_otherexpr_checked"], flagged_dict["afp_otherexpr_checked"], json.dumps(flagged_dict["afp_otherexpr_details"]),
                        flagged_dict["svm_seqchange_checked"], flagged_dict["afp_seqchange_checked"], json.dumps(flagged_dict["afp_seqchange_details"]),
                        flagged_dict["svm_geneint_checked"], flagged_dict["afp_geneint_checked"], json.dumps(flagged_dict["afp_geneint_details"]),
                        flagged_dict["svm_geneprod_checked"], flagged_dict["afp_geneprod_checked"], json.dumps(flagged_dict["afp_geneprod_details"]),
                        flagged_dict["svm_genereg_checked"], flagged_dict["afp_genereg_checked"], json.dumps(flagged_dict["afp_genereg_details"]),
                        flagged_dict["svm_newmutant_checked"], flagged_dict["afp_newmutant_checked"], json.dumps(flagged_dict["afp_newmutant_details"]),
                        flagged_dict["svm_rnai_checked"], flagged_dict["afp_rnai_checked"], json.dumps(flagged_dict["afp_rnai_details"]),
                        flagged_dict["svm_catalyticact_checked"], flagged_dict["afp_catalyticact_checked"], json.dumps(flagged_dict["afp_catalyticact_details"]),
                        flagged_dict["svm_overexpr_checked"], flagged_dict["afp_overexpr_checked"], json.dumps(flagged_dict["afp_overexpr_details"]))
                    resp.status = falcon.HTTP_200
                elif req_type == "other_yn":
                    other_yn = self.get_all_yes_no_data_types(paper_id)
                    resp.body = '{{"afp_modchange_checked": "{}", "afp_modchange_details": {}, ' \
                                '"afp_newantibody_checked": "{}", "afp_newantibody_details": {}, ' \
                                '"afp_siteaction_checked": "{}", "afp_siteaction_details": {}, ' \
                                '"afp_timeaction_checked": "{}", "afp_timeaction_details": {}, ' \
                                '"afp_rnaseq_checked": "{}", "afp_rnaseq_details": {}, ' \
                                '"afp_chemphen_checked": "{}", "afp_chemphen_details": {}, ' \
                                '"afp_envpheno_checked": "{}", "afp_envpheno_details": {}, ' \
                                '"afp_humdis_checked": "{}", "afp_humdis_details": {}, ' \
                                '"afp_additionalexpr": {}, "afp_othergenefunc_checked": "{}", ' \
                                '"afp_othergenefunc_details": {}}}'.format(
                                            other_yn["afp_modchange_checked"], json.dumps(other_yn["afp_modchange_details"]),
                                            other_yn["afp_newantibody_checked"], json.dumps(other_yn["afp_newantibody_details"]),
                                            other_yn["afp_siteaction_checked"], json.dumps(other_yn["afp_siteaction_details"]),
                                            other_yn["afp_timeaction_checked"], json.dumps(other_yn["afp_timeaction_details"]),
                                            other_yn["afp_rnaseq_checked"], json.dumps(other_yn["afp_rnaseq_details"]),
                                            other_yn["afp_chemphen_checked"], json.dumps(other_yn["afp_chemphen_details"]),
                                            other_yn["afp_envpheno_checked"], json.dumps(other_yn["afp_envpheno_details"]),
                                            other_yn["afp_humdis_checked"], json.dumps(other_yn["afp_humdis_details"]),
                                            json.dumps(other_yn["afp_additionalexpr"]), other_yn["afp_othergenefunc_checked"],
                                            json.dumps(other_yn["afp_othergenefunc_details"]))
                    resp.status = falcon.HTTP_200
                elif req_type == "others":
                    others = self.get_other_data_types(paper_id)
                    resp.body = '{{"afp_newalleles": {}, "afp_newstrains": {}, "afp_newtransgenes": {}, ' \
                                '"afp_otherantibodies": {}}}'.format(
                        json.dumps(others["afp_newalleles"]), json.dumps(others["afp_newstrains"]),
                        json.dumps(others["afp_newtransgenes"]), json.dumps(others["afp_otherantibodies"]))
                    resp.status = falcon.HTTP_200
                elif req_type == "comments":
                    comments = json.dumps(self.db._get_single_field(paper_id, "afp_comment"))
                    resp.body = '{{"afp_comments": {}}}'.format(comments)
                    resp.status = falcon.HTTP_200
                elif req_type == "converted_text":
                    fulltext, sentences, classes = self.get_text_from_pdfs(paper_id)
                    sentences = ["\"" + sentence + "\"" for sentence in sentences]
                    resp.body = (f'{{"fulltext": "{fulltext}", "sentences": [{", ".join(sentences)}],'
                                 f' "classes": {classes}}}')
                    resp.status = falcon.HTTP_200
                else:
                    raise falcon.HTTPError(falcon.HTTP_NOT_FOUND)
            else:
                if req_type == "stats_totals":
                    num_no_submission = self.db.afp.get_paper_ids_afp_no_submission(count=True)
                    num_full_submission = self.db.afp.get_paper_ids_afp_full_submission(count=True)
                    num_partial_submission = self.db.afp.get_paper_ids_afp_partial_submission(count=True)
                    num_processed = num_no_submission

                    num_papers_old_afp_processed = self.db.afp.get_num_papers_old_afp_processed()
                    num_papers_old_afp_author_submitted = self.db.afp.get_num_papers_old_afp_author_submitted()

                    resp.body = '{{"num_papers_new_afp_processed": "{}", "num_papers_old_afp_processed": "{}", ' \
                                '"num_papers_new_afp_author_submitted": "{}", "num_papers_old_afp_author_submitted": ' \
                                '"{}", "num_papers_new_afp_partial_sub": "{}"}}'\
                        .format(num_processed, num_papers_old_afp_processed,
                                num_full_submission, num_papers_old_afp_author_submitted,
                                num_partial_submission)
                    resp.status = falcon.HTTP_200
                elif req_type == "paper_stats":
                    num_extracted_genes_per_paper = self.db.afp.get_num_entities_per_paper("genestudied")
                    num_extracted_species_per_paper = self.db.afp.get_num_entities_per_paper("species")
                    num_extracted_alleles_per_paper = self.db.afp.get_num_entities_per_paper("variation")
                    num_extracted_strains_per_paper = self.db.afp.get_num_entities_per_paper("strain")
                    num_extracted_transgenes_per_paper = self.db.afp.get_num_entities_per_paper("transgene")
                    resp.body = '{{"num_extracted_genes_per_paper": {}, "num_extracted_species_per_paper": {}, ' \
                                '"num_extracted_alleles_per_paper": {}, "num_extracted_strains_per_paper": {}, ' \
                                '"num_extracted_transgenes_per_paper": {}}}'.format(
                        num_extracted_genes_per_paper, num_extracted_species_per_paper,
                        num_extracted_alleles_per_paper, num_extracted_strains_per_paper,
                        num_extracted_transgenes_per_paper)
                    resp.status = falcon.HTTP_200
                elif req_type == "papers":
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    list_type = req.media["list_type"]
                    svm_filters = req.media["svm_filters"].split(",")
                    manual_filters = req.media["manual_filters"].split(",")
                    curation_filters = req.media["curation_filters"].split(",")
                    combine_filters = req.media["combine_filters"]
                    if list_type == "processed":
                        num_papers = self.db.afp.get_paper_ids_afp_no_submission(
                                                 must_be_autclass_positive_data_types=svm_filters,
                                                 must_be_positive_manual_flag_data_types=manual_filters,
                                                 must_be_curation_negative_data_types=curation_filters,
                                                 combine_filters=combine_filters, count=True,
                                                 tazendra_user=self.tazendra_username,
                                                 tazendra_password=self.tazendra_password)
                        ids = self.db.afp.get_paper_ids_afp_no_submission(
                                                 must_be_autclass_positive_data_types=svm_filters,
                                                 must_be_positive_manual_flag_data_types=manual_filters,
                                                 must_be_curation_negative_data_types=curation_filters,
                                                 combine_filters=combine_filters,
                                                 offset=from_offset,
                                                 limit=count,
                                                 tazendra_user=self.tazendra_username,
                                                 tazendra_password=self.tazendra_password)
                        pap_titles = self.db.paper.get_papers_titles(paper_ids=ids) if ids else []
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             pap_titles[pap_id] + "\"}" for pap_id in ids])
                    elif list_type == "submitted":
                        num_papers = self.db.afp.get_paper_ids_afp_full_submission(
                            must_be_autclass_positive_data_types=svm_filters,
                            must_be_positive_manual_flag_data_types=manual_filters,
                            must_be_curation_negative_data_types=curation_filters,
                            combine_filters=combine_filters, count=True, tazendra_user=self.tazendra_username,
                            tazendra_password=self.tazendra_password)
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             self.db.paper.get_paper_title(pap_id) + "\"}" for pap_id in
                                             self.db.afp.get_paper_ids_afp_full_submission(
                                                 must_be_autclass_positive_data_types=svm_filters,
                                                 must_be_positive_manual_flag_data_types=manual_filters,
                                                 must_be_curation_negative_data_types=curation_filters,
                                                 combine_filters=combine_filters,
                                                 offset=from_offset,
                                                 limit=count, tazendra_user=self.tazendra_username,
                                                 tazendra_password=self.tazendra_password)])
                    elif list_type == "partial":
                        num_papers = self.db.afp.get_paper_ids_afp_partial_submission(
                            must_be_autclass_positive_data_types=svm_filters,
                            must_be_positive_manual_flag_data_types=manual_filters,
                            must_be_curation_negative_data_types=curation_filters,
                            combine_filters=combine_filters, count=True, tazendra_user=self.tazendra_username,
                            tazendra_password=self.tazendra_password)
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             self.db.paper.get_paper_title(pap_id) + "\"}" for pap_id in
                                             self.db.afp.get_paper_ids_afp_partial_submission(
                                                 must_be_autclass_positive_data_types=svm_filters,
                                                 must_be_positive_manual_flag_data_types=manual_filters,
                                                 must_be_curation_negative_data_types=curation_filters,
                                                 combine_filters=combine_filters,
                                                 offset=from_offset,
                                                 limit=count, tazendra_user=self.tazendra_username,
                                                 tazendra_password=self.tazendra_password)])
                    elif list_type == "empty":
                        num_papers = self.db.afp.get_num_papers_no_entities()
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             self.db.paper.get_paper_title(pap_id) + "\"}" for pap_id in
                                             self.db.afp.get_list_papers_no_entities(from_offset, count)])
                    else:
                        raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(
                        list_ids, num_papers)
                    resp.status = falcon.HTTP_200

                elif req_type == "all_papers":
                    list_type = req.media["list_type"]
                    svm_filters = req.media["svm_filters"].split(",")
                    manual_filters = req.media["manual_filters"].split(",")
                    curation_filters = req.media["curation_filters"].split(",")
                    combine_filters = req.media["combine_filters"]
                    if list_type == "processed":
                        all_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                            self.db.afp.get_paper_ids_afp_no_submission(
                                                must_be_autclass_positive_data_types=svm_filters,
                                                must_be_positive_manual_flag_data_types=manual_filters,
                                                must_be_curation_negative_data_types=curation_filters,
                                                combine_filters=combine_filters,
                                                offset=None, limit=None, tazendra_user=self.tazendra_username,
                                                tazendra_password=self.tazendra_password)])
                    elif list_type == "submitted":
                        all_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                            self.db.afp.get_paper_ids_afp_full_submission(
                                                must_be_autclass_positive_data_types=svm_filters,
                                                must_be_positive_manual_flag_data_types=manual_filters,
                                                must_be_curation_negative_data_types=curation_filters,
                                                combine_filters=combine_filters,
                                                offset=None, limit=None, tazendra_user=self.tazendra_username,
                                                tazendra_password=self.tazendra_password)])
                    elif list_type == "partial":
                        all_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                            self.db.afp.get_paper_ids_afp_partial_submission(
                                                must_be_autclass_positive_data_types=svm_filters,
                                                must_be_positive_manual_flag_data_types=manual_filters,
                                                must_be_curation_negative_data_types=curation_filters,
                                                combine_filters=combine_filters,
                                                offset=None, limit=None, tazendra_user=self.tazendra_username,
                                                tazendra_password=self.tazendra_password)])
                    elif list_type == "empty":
                        all_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                            self.db.afp.get_list_papers_no_entities(0, 0)])
                    resp.body = '{{"all_ids": [{}]}}'.format(all_ids)
                    resp.status = falcon.HTTP_200

                elif req_type == "contributors":
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    num_contrib = self.db.afp.get_num_contributors()
                    list_contrib = ",".join(["{\"name\":\"" + self.db.person.get_fullname_from_personid(self.db.person.get_person_id_from_email_address(contrib[0])) +
                                             "\",\"email\":\"" + contrib[0] +
                                             "\",\"count\":\"" + str(contrib[1]) + "\"}"
                                             for contrib in self.db.afp.get_list_contributors_with_numbers(from_offset,
                                                                                                           count)])
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(list_contrib, num_contrib)
                    resp.status = falcon.HTTP_200

                elif req_type == "most_emailed":
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    num_emailed = self.db.afp.get_num_unique_emailed_addresses()
                    list_emailed = ",".join(["{\"name\":\"" + self.db.person.get_fullname_from_personid(self.db.person.get_person_id_from_email_address(emailed[0])) +
                                             "\",\"email\":\"" + emailed[0] +
                                             "\",\"count\":\"" + str(emailed[1]) + "\"}"
                                             for emailed in self.db.afp.get_emailed_authors_with_count(from_offset, count)])
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(list_emailed, num_emailed)
                    resp.status = falcon.HTTP_200

                elif req_type == "entities_count":
                    entity_type = req.media["entity_type"]
                    if entity_type == "gene":
                        entity_type = EntityType.GENE
                    elif entity_type == "species":
                        entity_type = EntityType.SPECIES
                    elif entity_type == "strain":
                        entity_type = EntityType.STRAIN
                    elif entity_type == "transgenes":
                        entity_type = EntityType.TRANSGENE
                    elif entity_type == "variation":
                        entity_type = EntityType.VARIATION
                    added = bool(req.media["added"])
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    sorted_list, total_len = self.db.afp.get_author_modified_entities_with_counter(
                        entity_type=entity_type, added=added, limit=count, offset=from_offset)
                    list_entities = ",".join(["{\"name\":\"" + elem[1] + "\",\"id\":\"" + elem[2] +
                                             "\",\"count\":\"" + str(elem[0]) + "\"}" for elem in sorted_list])
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(list_entities, total_len)
                    resp.status = falcon.HTTP_200

                elif req_type == "stats_timeseries":
                    bin_size = req.media["bin_size"]
                    stats_ts = self.db.afp.get_stats_timeseries(bin_period=bin_size)
                    resp.body = json.dumps(stats_ts)
                    resp.status = falcon.HTTP_200
