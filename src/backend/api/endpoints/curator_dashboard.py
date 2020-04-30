import falcon
import logging

from src.backend.api.storagengin.curator_dashboard import CuratorDashboardStorageEngine


logger = logging.getLogger(__name__)


class CuratorDashboardReader:

    def __init__(self, storage_engine: CuratorDashboardStorageEngine, afp_base_url: str):
        self.db = storage_engine
        self.afp_base_url = afp_base_url

    def on_post(self, req, resp, req_type):
        with self.db:
            if req_type != "stats" and req_type != "papers" and req_type != "contributors" \
                    and req_type != "most_emailed":
                if "paper_id" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                paper_id = req.media["paper_id"]
                if req_type == "status":
                    afp_processed = self.db.paper_is_afp_processed(paper_id)
                    author_submitted = self.db.author_has_submitted(paper_id)
                    author_modified = self.db.author_has_modified(paper_id)
                    afp_form_link = self.db.get_afp_form_link(paper_id, self.afp_base_url)
                    title = self.db.get_paper_title(paper_id)
                    journal = self.db.get_paper_journal(paper_id)
                    email = self.db.get_corresponding_author_email(paper_id)
                    pmid = self.db.get_pmid_from_paper_id(paper_id)
                    doi = self.db.get_doi_from_paper_id(paper_id)
                    resp.body = '{{"title": "{}", "journal": "{}", "email": "{}", "afp_processed": {}, ' \
                                '"author_submitted": {}, "author_modified": {}, "afp_form_link": "{}", "pmid": "{}", ' \
                                '"doi": "{}"}}'.format(
                        title, journal, email,
                        "true" if afp_processed else "false", "true" if author_submitted else "false", "true" if
                        author_modified else "false", afp_form_link, pmid, doi)
                    resp.status = falcon.HTTP_200
                elif req_type == "lists":
                    lists_dict = self.db.get_all_lists(paper_id)
                    resp.body = '{{"tfp_genestudied": "{}", "afp_genestudied": "{}", "tfp_species": "{}", "afp_species": ' \
                                '"{}", "tfp_alleles": "{}", "afp_alleles": "{}", "tfp_strains": "{}", "afp_strains": ' \
                                '"{}", "tfp_transgenes": "{}", "afp_transgenes": "{}"}}'.format(
                        lists_dict["tfp_genestudied"], lists_dict["afp_genestudied"], lists_dict["tfp_species"],
                        lists_dict["afp_species"], lists_dict["tfp_alleles"], lists_dict["afp_alleles"],
                        lists_dict["tfp_strains"], lists_dict["afp_strains"], lists_dict["tfp_transgenes"],
                        lists_dict["afp_transgenes"])
                    resp.status = falcon.HTTP_200
                elif req_type == "flagged":
                    flagged_dict = self.db.get_all_flagged_data_types(paper_id)
                    resp.body = '{{"svm_otherexpr_checked": "{}", "afp_otherexpr_checked": "{}", ' \
                                '"afp_otherexpr_details": "{}", "svm_seqchange_checked": "{}", ' \
                                '"afp_seqchange_checked": "{}", ' \
                                '"afp_seqchange_details": "{}", "svm_geneint_checked": "{}", ' \
                                '"afp_geneint_checked": "{}", "afp_geneint_details": "{}", ' \
                                '"svm_geneprod_checked": "{}", "afp_geneprod_checked": "{}" ,' \
                                '"afp_geneprod_details": "{}", "svm_genereg_checked": "{}",' \
                                '"afp_genereg_checked": "{}", "afp_genereg_details": "{}", ' \
                                '"svm_newmutant_checked": "{}", "afp_newmutant_checked": "{}", ' \
                                '"afp_newmutant_details": "{}", "svm_rnai_checked": "{}",' \
                                ' "afp_rnai_checked": "{}", "afp_rnai_details": "{}", ' \
                                '"svm_overexpr_checked": "{}", "afp_overexpr_checked": "{}", ' \
                                '"afp_overexpr_details": "{}"}}'.format(
                        flagged_dict["svm_otherexpr_checked"], flagged_dict["afp_otherexpr_checked"], repr(flagged_dict["afp_otherexpr_details"]),
                        flagged_dict["svm_seqchange_checked"], flagged_dict["afp_seqchange_checked"], repr(flagged_dict["afp_seqchange_details"]),
                        flagged_dict["svm_geneint_checked"], flagged_dict["afp_geneint_checked"], repr(flagged_dict["afp_geneint_details"]),
                        flagged_dict["svm_geneprod_checked"], flagged_dict["afp_geneprod_checked"], repr(flagged_dict["afp_geneprod_details"]),
                        flagged_dict["svm_genereg_checked"], flagged_dict["afp_genereg_checked"], repr(flagged_dict["afp_genereg_details"]),
                        flagged_dict["svm_newmutant_checked"], flagged_dict["afp_newmutant_checked"], repr(flagged_dict["afp_newmutant_details"]),
                        flagged_dict["svm_rnai_checked"], flagged_dict["afp_rnai_checked"], repr(flagged_dict["afp_rnai_details"]),
                        flagged_dict["svm_overexpr_checked"], flagged_dict["afp_overexpr_checked"], repr(flagged_dict["afp_overexpr_details"]))
                    resp.status = falcon.HTTP_200
                elif req_type == "other_yn":
                    other_yn = self.db.get_all_yes_no_data_types(paper_id)
                    resp.body = '{{"afp_modchange_checked": "{}", "afp_modchange_details": "{}", ' \
                                '"afp_newantibody_checked": "{}", "afp_newantibody_details": "{}", ' \
                                '"afp_siteaction_checked": "{}", "afp_siteaction_details": "{}", ' \
                                '"afp_timeaction_checked": "{}", "afp_timeaction_details": "{}", ' \
                                '"afp_rnaseq_checked": "{}", "afp_rnaseq_details": "{}", ' \
                                '"afp_chemphen_checked": "{}", "afp_chemphen_details": "{}", ' \
                                '"afp_envpheno_checked": "{}", "afp_envpheno_details": "{}", ' \
                                '"afp_catalyticact_checked": "{}", "afp_catalyticact_details": "{}", ' \
                                '"afp_humdis_checked": "{}", "afp_humdis_details": "{}", ' \
                                '"afp_additionalexpr": "{}"}}'.format(
                                            other_yn["afp_modchange_checked"], repr(other_yn["afp_modchange_details"]),
                                            other_yn["afp_newantibody_checked"], repr(other_yn["afp_newantibody_details"]),
                                            other_yn["afp_siteaction_checked"], repr(other_yn["afp_siteaction_details"]),
                                            other_yn["afp_timeaction_checked"], repr(other_yn["afp_timeaction_details"]),
                                            other_yn["afp_rnaseq_checked"], repr(other_yn["afp_rnaseq_details"]),
                                            other_yn["afp_chemphen_checked"], repr(other_yn["afp_chemphen_details"]),
                                            other_yn["afp_envpheno_checked"], repr(other_yn["afp_envpheno_details"]),
                                            other_yn["afp_catalyticact_checked"], repr(other_yn["afp_catalyticact_details"]),
                                            other_yn["afp_humdis_checked"], repr(other_yn["afp_humdis_details"]),
                                            repr(other_yn["afp_additionalexpr"]))
                    resp.status = falcon.HTTP_200
                elif req_type == "others":
                    others = self.db.get_other_data_types(paper_id)
                    resp.body = '{{"afp_newalleles": "{}", "afp_newstrains": "{}", "afp_newtransgenes": "{}", ' \
                                '"afp_otherantibodies": "{}"}}'.format(others["afp_newalleles"], others["afp_newstrains"],
                                                                       others["afp_newtransgenes"],
                                                                       others["afp_otherantibodies"])
                    resp.status = falcon.HTTP_200
                elif req_type == "comments":
                    comments = repr(self.db.get_comments(paper_id))
                    resp.body = '{{"afp_comments": "{}"}}'.format(comments)
                    resp.status = falcon.HTTP_200
                else:
                    raise falcon.HTTPError(falcon.HTTP_NOT_FOUND)
            else:
                if req_type == "stats":
                    num_papers_new_afp_processed = self.db.get_num_papers_new_afp_processed()
                    num_papers_old_afp_processed = self.db.get_num_papers_old_afp_processed()
                    num_papers_new_afp_author_submitted = self.db.get_num_papers_new_afp_author_submitted()
                    num_papers_old_afp_author_submitted = self.db.get_num_papers_old_afp_author_submitted()
                    num_papers_new_afp_partial_sub = self.db.get_num_papers_new_afp_partial_submissions()
                    num_extracted_genes_per_paper = self.db.get_num_entities_extracted_by_afp("genestudied")
                    num_extracted_species_per_paper = self.db.get_num_entities_extracted_by_afp("species")
                    num_extracted_alleles_per_paper = self.db.get_num_entities_extracted_by_afp("variation")
                    num_extracted_strains_per_paper = self.db.get_num_entities_extracted_by_afp("strain")
                    num_extracted_transgenes_per_paper = self.db.get_num_entities_extracted_by_afp("transgene")
                    resp.body = '{{"num_papers_new_afp_processed": "{}", "num_papers_old_afp_processed": "{}", ' \
                                '"num_papers_new_afp_author_submitted": "{}", "num_papers_old_afp_author_submitted": ' \
                                '"{}", "num_papers_new_afp_partial_sub": ' \
                                '"{}", "num_extracted_genes_per_paper": {}, "num_extracted_species_per_paper": {}, ' \
                                '"num_extracted_alleles_per_paper": {}, "num_extracted_strains_per_paper": {}, ' \
                                '"num_extracted_transgenes_per_paper": {}}}'\
                        .format(num_papers_new_afp_processed, num_papers_old_afp_processed,
                                num_papers_new_afp_author_submitted, num_papers_old_afp_author_submitted,
                                num_papers_new_afp_partial_sub,
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
                        num_papers = self.db.get_num_papers_new_afp_processed(svm_filters, manual_filters,
                                                                              curation_filters, combine_filters)
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             self.db.get_paper_title(pap_id) + "\"}" for pap_id in
                                             self.db.get_list_paper_ids_afp_processed(
                                                 from_offset, count, svm_filters, manual_filters, curation_filters,
                                                 combine_filters)])
                    elif list_type == "submitted":
                        num_papers = self.db.get_num_papers_new_afp_author_submitted(svm_filters, manual_filters,
                                                                                     curation_filters, combine_filters)
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             self.db.get_paper_title(pap_id) + "\"}" for pap_id in
                                             self.db.get_list_paper_ids_afp_submitted(
                                                 from_offset, count, svm_filters, manual_filters, curation_filters,
                                                 combine_filters)])
                    elif list_type == "partial":
                        num_papers = self.db.get_num_papers_new_afp_partial_submissions(svm_filters, manual_filters,
                                                                                        curation_filters,
                                                                                        combine_filters)
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             self.db.get_paper_title(pap_id) + "\"}" for pap_id in
                                             self.db.get_list_papers_new_afp_partial_submissions(
                                                 from_offset, count, svm_filters, manual_filters, curation_filters,
                                                 combine_filters)])
                    elif list_type == "empty":
                        num_papers = self.db.get_num_papers_no_entities()
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             self.db.get_paper_title(pap_id) + "\"}" for pap_id in
                                             self.db.get_list_papers_no_entities(from_offset, count)])
                    else:
                        raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(list_ids, num_papers)
                    resp.status = falcon.HTTP_200

                elif req_type == "contributors":
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    num_contrib = self.db.get_num_contributors()
                    list_contrib = ",".join(["{\"name\":\"" + self.db.get_user_fullname_from_email(contrib[0]) +
                                             "\",\"email\":\"" + contrib[0] +
                                             "\",\"count\":\"" + str(contrib[1]) + "\"}"
                                             for contrib in self.db.get_list_contributors_with_numbers(from_offset,
                                                                                                       count)])
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(list_contrib, num_contrib)
                    resp.status = falcon.HTTP_200

                elif req_type == "most_emailed":
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    num_emailed = self.db.get_num_emailed()
                    list_emailed = ",".join(["{\"name\":\"" + self.db.get_user_fullname_from_email(emailed[0]) +
                                             "\",\"email\":\"" + emailed[0] +
                                             "\",\"count\":\"" + str(emailed[1]) + "\"}"
                                             for emailed in self.db.get_list_emailed_with_numbers(from_offset, count)])
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(list_emailed, num_emailed)
                    resp.status = falcon.HTTP_200
