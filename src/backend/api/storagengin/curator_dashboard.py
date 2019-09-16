import json
import logging

from src.backend.api.storagengin.afp_storage_engine import AFPStorageBaseEngine


logger = logging.getLogger(__name__)


class CuratorDashboardStorageEngine(AFPStorageBaseEngine):

    def __init__(self, dbname, user, password, host):
        super().__init__(dbname, user, password, host)

    def get_all_lists(self, paper_id):
        tfp_genestudied = self.db_manager.get_feature("tfp_genestudied", paper_id)
        afp_genestudied = self.db_manager.get_feature("afp_genestudied", paper_id)
        tfp_species = self.db_manager.get_feature("tfp_species", paper_id)
        afp_species = self.db_manager.get_feature("afp_species", paper_id)
        tfp_alleles = self.db_manager.get_feature("tfp_variation", paper_id)
        afp_alleles = self.db_manager.get_feature("afp_variation", paper_id)
        tfp_strains = self.db_manager.get_feature("tfp_strain", paper_id)
        afp_strains = self.db_manager.get_feature("afp_strain", paper_id)
        tfp_transgenes = self.db_manager.get_feature("tfp_transgene", paper_id)
        afp_transgenes = self.db_manager.get_feature("afp_transgene", paper_id)
        return {"tfp_genestudied": tfp_genestudied, "afp_genestudied": afp_genestudied, "tfp_species": tfp_species,
                "afp_species": afp_species, "tfp_alleles": tfp_alleles, "afp_alleles": afp_alleles,
                "tfp_strains": tfp_strains, "afp_strains": afp_strains, "tfp_transgenes": tfp_transgenes,
                "afp_transgenes": afp_transgenes}

    def get_all_flagged_data_types(self, paper_id):
        svm_otherexpr = self.db_manager.get_svm_value("otherexpr", paper_id)
        afp_otherexpr = self.db_manager.get_feature("afp_otherexpr", paper_id)
        afp_otherexpr_checked = afp_otherexpr != "" and afp_otherexpr != "null"
        afp_otherexpr_details = afp_otherexpr if afp_otherexpr != "Checked" and afp_otherexpr != "checked" and \
                                                 afp_otherexpr != "" else ""

        svm_seqchange = self.db_manager.get_svm_value("seqchange", paper_id)
        afp_seqchange = self.db_manager.get_feature("afp_seqchange", paper_id)
        afp_seqchange_checked = afp_seqchange != "" and afp_seqchange != "null"
        afp_seqchange_details = afp_seqchange if afp_seqchange != "Checked" and afp_seqchange != "checked" and \
                                                 afp_seqchange != "" else ""
        svm_geneint = self.db_manager.get_svm_value("geneint", paper_id)
        afp_geneint = self.db_manager.get_feature("afp_geneint", paper_id)
        afp_geneint_checked = afp_geneint != "" and afp_geneint != "null"
        afp_geneint_details = afp_geneint if afp_geneint != "Checked" and afp_geneint != "checked" and \
                                             afp_geneint != "" else ""
        svm_geneprod = self.db_manager.get_svm_value("geneprod", paper_id)
        afp_geneprod = self.db_manager.get_feature("afp_geneprod", paper_id)
        afp_geneprod_checked = afp_geneprod != "" and afp_geneprod != "null"
        afp_geneprod_details = afp_geneprod if afp_geneprod != "Checked" and afp_geneprod != "checked" and \
                                               afp_geneprod != "" else ""
        svm_genereg = self.db_manager.get_svm_value("genereg", paper_id)
        afp_genereg = self.db_manager.get_feature("afp_genereg", paper_id)
        afp_genereg_checked = afp_genereg != "" and afp_genereg != "null"
        afp_genereg_details = afp_genereg if afp_genereg != "Checked" and afp_genereg != "checked" and \
                                             afp_genereg != "" else ""
        svm_newmutant = self.db_manager.get_svm_value("newmutant", paper_id)
        afp_newmutant = self.db_manager.get_feature("afp_newmutant", paper_id)
        afp_newmutant_checked = afp_newmutant != "" and afp_newmutant != "null"
        afp_newmutant_details = afp_newmutant if afp_newmutant != "Checked" and afp_newmutant != "checked" and \
                                                 afp_newmutant != "" else ""
        svm_rnai = self.db_manager.get_svm_value("rnai", paper_id)
        afp_rnai = self.db_manager.get_feature("afp_rnai", paper_id)
        afp_rnai_checked = afp_rnai != "" and afp_rnai != "null"
        afp_rnai_details = afp_rnai if afp_rnai != "Checked" and afp_rnai != "checked" and afp_rnai != "" else ""
        svm_overexpr = self.db_manager.get_svm_value("overexpr", paper_id)
        afp_overexpr = self.db_manager.get_feature("afp_overexpr", paper_id)
        afp_overexpr_checked = afp_overexpr != "" and afp_overexpr != "null"
        afp_overexpr_details = afp_overexpr if afp_overexpr != "Checked" and afp_overexpr != "checked" and \
                                               afp_overexpr != "" else ""
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
                "afp_overexpr_details": afp_overexpr_details}

    def get_all_yes_no_data_types(self, paper_id):
        afp_modchange = self.db_manager.get_feature("afp_structcorr", paper_id)
        afp_modchange_checked = afp_modchange != "" and afp_modchange != "null"
        afp_modchange_details = afp_modchange if afp_modchange != "Checked" and afp_modchange != "checked" and \
                                                 afp_modchange != "" else ""
        afp_newantibody = self.db_manager.get_feature("afp_antibody", paper_id)
        afp_newantibody_checked = afp_newantibody != "" and afp_newantibody != "null"
        afp_newantibody_details = afp_newantibody if afp_newantibody != "Checked" and afp_newantibody != "checked" and \
                                                     afp_newantibody != "" else ""
        afp_siteaction = self.db_manager.get_feature("afp_siteaction", paper_id)
        afp_siteaction_checked = afp_siteaction != "" and afp_siteaction != "null"
        afp_siteaction_details = afp_siteaction if afp_siteaction != "Checked" and afp_siteaction != "checked" and \
                                                   afp_siteaction != "" else ""
        afp_timeaction = self.db_manager.get_feature("afp_timeaction", paper_id)
        afp_timeaction_checked = afp_timeaction != "" and afp_timeaction != "null"
        afp_timeaction_details = afp_timeaction if afp_timeaction != "Checked" and afp_timeaction != "checked" and \
                                                   afp_timeaction != "" else ""
        afp_rnaseq = self.db_manager.get_feature("afp_rnaseq", paper_id)
        afp_rnaseq_checked = afp_rnaseq != "" and afp_rnaseq != "null"
        afp_rnaseq_details = afp_rnaseq if afp_rnaseq != "Checked" and afp_rnaseq != "checked" and \
                                           afp_rnaseq != "" else ""
        afp_chemphen = self.db_manager.get_feature("afp_chemphen", paper_id)
        afp_chemphen_checked = afp_chemphen != "" and afp_chemphen != "null"
        afp_chemphen_details = afp_chemphen if afp_chemphen != "Checked" and afp_chemphen != "checked" and \
                                               afp_chemphen != "" else ""
        afp_envpheno = self.db_manager.get_feature("afp_envpheno", paper_id)
        afp_envpheno_checked = afp_envpheno != "" and afp_envpheno != "null"
        afp_envpheno_details = afp_envpheno if afp_envpheno != "Checked" and afp_envpheno != "checked" and \
                                               afp_envpheno != "" else ""
        afp_catalyticact = self.db_manager.get_feature("afp_catalyticact", paper_id)
        afp_catalyticact_checked = afp_catalyticact != "" and afp_catalyticact != "null"
        afp_catalyticact_details = afp_catalyticact if afp_catalyticact != "Checked" and afp_catalyticact != \
                                                       "checked" and afp_catalyticact != "" else ""
        afp_humdis = self.db_manager.get_feature("afp_humdis", paper_id)
        afp_humdis_checked = afp_humdis != "" and afp_humdis != "null"
        afp_humdis_details = afp_humdis if afp_humdis != "Checked" and afp_humdis != "checked" and \
                                           afp_humdis != "" else ""
        afp_additionalexpr = self.db_manager.get_feature("afp_additionalexpr", paper_id)
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
                "afp_additionalexpr": afp_additionalexpr}

    def get_other_data_types(self, paper_id):
        othervariations = self.db_manager.get_feature("afp_othervariation", paper_id)
        afp_newalleles = " | ".join([elem['name'] for elem in json.loads(othervariations)]) if \
            othervariations and othervariations != 'null' else ""
        otherstrains = self.db_manager.get_feature("afp_otherstrain", paper_id)
        afp_newstrains = " | ".join([elem['name'] for elem in json.loads(otherstrains)]) if \
            otherstrains and otherstrains != 'null' else ""
        othertransgenes = self.db_manager.get_feature("afp_othertransgene", paper_id)
        afp_newtransgenes = " | ".join([elem['name'] for elem in json.loads(othertransgenes)]) if \
            othertransgenes and othertransgenes != 'null' else ""
        otherantibodies = self.db_manager.get_feature("afp_otherantibody", paper_id)
        afp_otherantibodies = " | ".join([elem['name'] + ";%;" + elem["publicationId"] for elem in
                                          json.loads(otherantibodies) if
                                          elem["name"] != ""]) if otherantibodies and otherantibodies != 'null' else ""
        return {"afp_newalleles": afp_newalleles, "afp_newstrains": afp_newstrains,
                "afp_newtransgenes": afp_newtransgenes, "afp_otherantibodies": afp_otherantibodies}

    def paper_is_afp_processed(self, paper_id):
        afp_version = self.db_manager.get_feature("afp_version", paper_id)
        return afp_version != "" and afp_version != "null"

    def author_has_submitted(self, paper_id):
        return self.db_manager.author_has_submitted(paper_id)

    def author_has_modified(self, paper_id):
        return self.db_manager.author_has_modified(paper_id)

    def get_comments(self, paper_id):
        return self.db_manager.get_feature("afp_comment", paper_id)

    def get_num_papers_new_afp_processed(self, svm_filters=None, manual_filters=None):
        return self.db_manager.get_num_papers_new_afp_processed(svm_filters, manual_filters)

    def get_num_papers_old_afp_processed(self):
        return self.db_manager.get_num_papers_old_afp_processed()

    def get_num_papers_new_afp_author_submitted(self, svm_filters=None, manual_filters=None):
        return self.db_manager.get_num_papers_new_afp_author_submitted(svm_filters, manual_filters)

    def get_num_papers_old_afp_author_submitted(self):
        return self.db_manager.get_num_papers_old_afp_author_submitted()

    def get_num_entities_extracted_by_afp(self, entity_label):
        return self.db_manager.get_num_entities_extracted_by_afp(entity_label)

    def get_list_paper_ids_afp_processed(self, from_offset, count, svm_filter=None, manual_filters=None):
        return self.db_manager.get_list_paper_ids_afp_processed(from_offset, count, svm_filter, manual_filters)

    def get_list_paper_ids_afp_submitted(self, from_offset, count, svm_filters=None, manual_filters=None):
        return self.db_manager.get_list_paper_ids_afp_submitted(from_offset, count, svm_filters, manual_filters)

    def get_num_papers_new_afp_partial_submissions(self, svm_filters=None, manual_filters=None):
        return self.db_manager.get_num_papers_new_afp_partial_submissions(svm_filters, manual_filters)

    def get_list_papers_new_afp_partial_submissions(self, from_offset, count, svm_filters=None, manual_filters=None):
        return self.db_manager.get_list_papers_new_afp_partial_submissions(from_offset, count, svm_filters,
                                                                           manual_filters)

    def get_corresponding_author_email(self, paper_id):
        return self.db_manager.get_afp_email(paper_id)

    def get_doi_from_paper_id(self, paper_id):
        return self.db_manager.get_doi_from_paper_id(paper_id)

    def get_num_papers_no_entities(self):
        return self.db_manager.get_num_papers_no_entities()

    def get_list_papers_no_entities(self, from_offset, count):
        return self.db_manager.get_list_papers_no_entities(from_offset, count)
