#!/usr/bin/env python3

import argparse
import json
import logging
import urllib.parse

from typing import List
from urllib.request import urlopen
import falcon
from wsgiref import simple_server
from db_manager import DBManager
from falcon import HTTPStatus

from email_functions import send_new_submission_notification_email_to_admin


class StorageEngine(object):

    def __init__(self, dbname, user, password, host):
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host
        self.db_manager = None

    def __enter__(self):
        self.db_manager = DBManager(self.dbname, self.user, self.password, self.host)

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.db_manager.close()

    def get_paper_id_from_passwd(self, passwd):
        return self.db_manager.get_paper_id_from_passwd(passwd)

    def get_paper_title(self, paper_id):
        return self.db_manager.get_paper_title(paper_id=paper_id)

    def get_paper_journal(self, paper_id):
        return self.db_manager.get_paper_journal(paper_id=paper_id)

    def get_user_fullname_from_personid(self, person_id):
        return self.db_manager.get_user_fullname_from_personid(person_id=person_id)

    def get_pmid_from_paper_id(self, paper_id):
        return self.db_manager.get_pmid(paper_id)

    # Overview

    def store_genes_list(self, genes, paper_id):
        self.db_manager.set_gene_list(genes=genes, paper_id=paper_id)

    def store_gene_model_update(self, gene_model_string, paper_id):
        self.db_manager.set_gene_model_update(gene_model_update=gene_model_string, paper_id=paper_id)

    def store_species_list(self, species, paper_id):
        self.db_manager.set_species_list(species=species, paper_id=paper_id)

    # Genetics

    def store_alleles_list(self, alleles, paper_id):
        self.db_manager.set_alleles_list(alleles=alleles, paper_id=paper_id)

    def store_allele_seq_change(self, allele_seq_change, paper_id):
        self.db_manager.set_allele_seq_change(allele_seq_change=allele_seq_change, paper_id=paper_id)

    def store_other_alleles(self, other_alleles, paper_id):
        self.db_manager.set_other_alleles(other_alleles=other_alleles, paper_id=paper_id)

    def store_strains_list(self, strains, paper_id):
        self.db_manager.set_strains_list(strains=strains, paper_id=paper_id)

    def store_other_strains(self, other_strains, paper_id):
        self.db_manager.set_other_strains(other_strains=other_strains, paper_id=paper_id)

    # Reagent

    def store_transgenes_list(self, transgenes, paper_id):
        self.db_manager.set_transgenes_list(transgenes=transgenes, paper_id=paper_id)

    def store_new_transgenes(self, new_transgenes, paper_id):
        self.db_manager.set_new_transgenes(new_transgenes=new_transgenes, paper_id=paper_id)

    def store_new_antibody(self, new_antibody, paper_id):
        self.db_manager.set_new_antibody(new_antibody=new_antibody, paper_id=paper_id)

    def store_other_antibodies(self, other_antibodies, paper_id):
        self.db_manager.set_other_antibodies(other_antibodies=other_antibodies, paper_id=paper_id)

    # Expression

    def store_anatomic_expr(self, anatomic_expr, paper_id):
        self.db_manager.set_anatomic_expr(anatomic_expr=anatomic_expr, paper_id=paper_id)

    def store_site_action(self, site_action, paper_id):
        self.db_manager.set_site_action(site_action=site_action, paper_id=paper_id)

    def store_time_action(self, time_action, paper_id):
        self.db_manager.set_time_action(time_action=time_action, paper_id=paper_id)

    def store_rnaseq(self, rnaseq, paper_id):
        self.db_manager.set_rnaseq(rnaseq=rnaseq, paper_id=paper_id)

    def store_additional_expr(self, additional_expr, paper_id):
        self.db_manager.set_additional_expr(additional_expr=additional_expr, paper_id=paper_id)

    # Interactions

    def store_gene_int(self, gene_int, paper_id):
        self.db_manager.set_gene_int(gene_int=gene_int, paper_id=paper_id)

    def store_phys_int(self, phys_int, paper_id):
        self.db_manager.set_phys_int(phys_int=phys_int, paper_id=paper_id)

    def store_gene_reg(self, gene_reg, paper_id):
        self.db_manager.set_gene_reg(gene_reg=gene_reg, paper_id=paper_id)

    # Phenotypes

    def store_allele_pheno(self, allele_pheno, paper_id):
        self.db_manager.set_allele_pheno(allele_pheno=allele_pheno, paper_id=paper_id)

    def store_rnai_pheno(self, rnai_pheno, paper_id):
        self.db_manager.set_rnai_pheno(rnai_pheno=rnai_pheno, paper_id=paper_id)

    def store_transover_pheno(self, transover_pheno, paper_id):
        self.db_manager.set_transover_pheno(transover_pheno=transover_pheno, paper_id=paper_id)

    def store_chemical(self, chemical, paper_id):
        self.db_manager.set_chemical(chemical=chemical, paper_id=paper_id)

    def store_env(self, env, paper_id):
        self.db_manager.set_env(env=env, paper_id=paper_id)

    def store_protein(self, protein, paper_id):
            self.db_manager.set_protein(protein=protein, paper_id=paper_id)

    # Disease

    def store_disease(self, disease, paper_id):
        self.db_manager.set_disease(disease=disease, paper_id=paper_id)

    # Comments

    def store_comments(self, comments, paper_id, person_id):
        self.db_manager.set_comments(comments=comments, paper_id=paper_id)
        self.db_manager.set_pap_gene_list(paper_id=paper_id, person_id=person_id)
        self.db_manager.set_pap_species_list(paper_id=paper_id, person_id=person_id)
        self.db_manager.set_version(paper_id=paper_id)
        self.db_manager.set_last_touched(paper_id=paper_id)

    # Reader

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
        return {"svm_seqchange_checked": svm_seqchange, "afp_seqchange_checked": afp_seqchange_checked,
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

    def get_afp_form_link(self, paper_id, base_url):
        return self.db_manager.get_afp_form_link(paper_id, base_url)

    def get_comments(self, paper_id):
        return self.db_manager.get_feature("afp_comment", paper_id)

    def get_num_papers_new_afp_processed(self):
        return self.db_manager.get_num_papers_new_afp_processed()

    def get_num_papers_old_afp_processed(self):
        return self.db_manager.get_num_papers_old_afp_processed()

    def get_num_papers_new_afp_author_submitted(self):
        return self.db_manager.get_num_papers_new_afp_author_submitted()

    def get_num_papers_old_afp_author_submitted(self):
        return self.db_manager.get_num_papers_old_afp_author_submitted()

    def get_num_entities_extracted_by_afp(self, entity_label):
        return self.db_manager.get_num_entities_extracted_by_afp(entity_label)

    def get_list_paper_ids_afp_processed(self, from_offset, count):
        return self.db_manager.get_list_paper_ids_afp_processed(from_offset, count)

    def get_list_paper_ids_afp_submitted(self, from_offset, count):
        return self.db_manager.get_list_paper_ids_afp_submitted(from_offset, count)

    def get_num_papers_new_afp_partial_submissions(self):
        return self.db_manager.get_num_papers_new_afp_partial_submissions()

    def get_list_papers_new_afp_partial_submissions(self, from_offset, count):
        return self.db_manager.get_list_papers_new_afp_partial_submissions(from_offset, count)

    def get_corresponding_author_email(self, paper_id):
        return self.db_manager.get_afp_email(paper_id)

    def get_doi_from_paper_id(self, paper_id):
        return self.db_manager.get_doi_from_paper_id(paper_id)

    def get_author_token_from_email(self, email):
        return self.db_manager.get_author_token_from_email(email)

    def get_papers_processed_from_auth_token(self, token, offset, count):
        return self.db_manager.get_papers_processed_from_auth_token(token, offset, count)

    def get_papers_submitted_from_auth_token(self, token, offset, count):
        return self.db_manager.get_papers_submitted_from_auth_token(token, offset, count)


class AFPWriter:

    def __init__(self, storage_engine: StorageEngine, admin_emails: List[str], email_passwd: str, afp_base_url: str):
        self.db = storage_engine
        self.logger = logging.getLogger("AFP API")
        self.admin_emails = admin_emails
        self.email_passwd = email_passwd
        self.afp_base_url = afp_base_url

    def on_post(self, req, resp):
        with self.db:
            paper_id = self.db.get_paper_id_from_passwd(req.media["passwd"])
            if paper_id:
                self.logger.info("paper found")

                # overview
                if "gene_list" in req.media:
                    self.db.store_genes_list(genes=req.media["gene_list"], paper_id=paper_id)
                if "gene_model_update" in req.media:
                    self.db.store_gene_model_update(gene_model_string=req.media["gene_model_update"], paper_id=paper_id)
                if "species_list" in req.media:
                    self.db.store_species_list(species=req.media["species_list"], paper_id=paper_id)

                # genetics
                if "alleles_list" in req.media:
                    self.db.store_alleles_list(alleles=req.media["alleles_list"], paper_id=paper_id)
                if "allele_seq_change" in req.media:
                    self.db.store_allele_seq_change(allele_seq_change=req.media["allele_seq_change"], paper_id=paper_id)
                if "other_alleles" in req.media:
                    self.db.store_other_alleles(other_alleles=req.media["other_alleles"], paper_id=paper_id)
                if "strains_list" in req.media:
                    self.db.store_strains_list(strains=req.media["strains_list"], paper_id=paper_id)
                if "other_strains" in req.media:
                    self.db.store_other_strains(other_strains=req.media["other_strains"], paper_id=paper_id)

                # reagent
                if "transgenes_list" in req.media:
                    self.db.store_transgenes_list(transgenes=req.media["transgenes_list"], paper_id=paper_id)
                if "new_transgenes" in req.media:
                    self.db.store_new_transgenes(new_transgenes=req.media["new_transgenes"], paper_id=paper_id)
                if "new_antibody" in req.media:
                    self.db.store_new_antibody(new_antibody=req.media["new_antibody"], paper_id=paper_id)
                if "other_antibodies" in req.media:
                    self.db.store_other_antibodies(other_antibodies=req.media["other_antibodies"], paper_id=paper_id)

                # expression
                if "anatomic_expr" in req.media:
                    self.db.store_anatomic_expr(anatomic_expr=req.media["anatomic_expr"], paper_id=paper_id)
                if "site_action" in req.media:
                    self.db.store_site_action(site_action=req.media["site_action"], paper_id=paper_id)
                if "time_action" in req.media:
                    self.db.store_time_action(time_action=req.media["time_action"], paper_id=paper_id)
                if "rnaseq" in req.media:
                    self.db.store_rnaseq(rnaseq=req.media["rnaseq"], paper_id=paper_id)
                if "additional_expr" in req.media:
                    self.db.store_additional_expr(additional_expr=req.media["additional_expr"], paper_id=paper_id)

                # interactions
                if "gene_int" in req.media:
                    self.db.store_gene_int(gene_int=req.media["gene_int"], paper_id=paper_id)
                if "phys_int" in req.media:
                    self.db.store_phys_int(phys_int=req.media["phys_int"], paper_id=paper_id)
                if "gene_reg" in req.media:
                    self.db.store_gene_reg(gene_reg=req.media["gene_reg"], paper_id=paper_id)

                # phenotypes
                if "allele_pheno" in req.media:
                    self.db.store_allele_pheno(allele_pheno=req.media["allele_pheno"], paper_id=paper_id)
                if "rnai_pheno" in req.media:
                    self.db.store_rnai_pheno(rnai_pheno=req.media["rnai_pheno"], paper_id=paper_id)
                if "transover_pheno" in req.media:
                    self.db.store_transover_pheno(transover_pheno=req.media["transover_pheno"], paper_id=paper_id)
                if "chemical" in req.media:
                    self.db.store_chemical(chemical=req.media["chemical"], paper_id=paper_id)
                if "env" in req.media:
                    self.db.store_env(env=req.media["env"], paper_id=paper_id)
                if "protein" in req.media:
                    self.db.store_protein(protein=req.media["protein"], paper_id=paper_id)

                # disease
                if "disease" in req.media:
                    self.db.store_disease(disease=req.media["disease"], paper_id=paper_id)

                # comments
                if "comments" in req.media:
                    self.db.store_comments(comments=req.media["comments"], paper_id=paper_id,
                                           person_id=req.media["person_id"])
                    paper_title = self.db.get_paper_title(paper_id)
                    paper_journal = self.db.get_paper_journal(paper_id)
                    url = self.afp_base_url + "?paper=" + paper_id + "&passwd=" + req.media["passwd"] + "&title=" + \
                                              urllib.parse.quote(paper_title) + "&journal=" + \
                                              urllib.parse.quote(paper_journal) + "&pmid=" + \
                                              self.db.get_pmid_from_paper_id(paper_id) + "&personid=" + \
                                              req.media["person_id"][3:] + \
                                              "&hide_genes=false&hide_alleles=false&hide_strains=false"
                    data = urlopen("http://tinyurl.com/api-create.php?url=" + url)
                    tiny_url = data.read().decode('utf-8')
                    send_new_submission_notification_email_to_admin(paper_id, req.media["passwd"], paper_title,
                                                                    paper_journal, self.admin_emails, self.email_passwd,
                                                                    tiny_url)

            else:
                raise falcon.HTTPError(falcon.HTTP_401)


class AFPReader:

    def __init__(self, storage_engine: StorageEngine, admin_emails: List[str], email_passwd: str):
        self.db = storage_engine
        self.logger = logging.getLogger("AFP API")
        self.admin_emails = admin_emails
        self.email_passwd = email_passwd

    def on_post(self, req, resp):
        with self.db:
            paper_id = self.db.get_paper_id_from_passwd(req.media["passwd"])
            if paper_id:
                self.logger.info("paper found")

                if "person_id" in req.media:
                    fullname = self.db.get_user_fullname_from_personid(person_id="two" + req.media["person_id"])
                    resp.body = '{{"fullname": "{}"}}'.format(fullname)
                    resp.status = falcon.HTTP_200

            else:
                raise falcon.HTTPError(falcon.HTTP_401)


class AFPReaderAdminLists:

    def __init__(self, storage_engine: StorageEngine, afp_base_url: str):
        self.db = storage_engine
        self.logger = logging.getLogger("AFP API for Admin")
        self.afp_base_url = afp_base_url

    def on_post(self, req, resp, req_type):
        with self.db:
            if req_type != "stats" and req_type != "papers":
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
                    resp.body = '{{"svm_seqchange_checked": "{}", "afp_seqchange_checked": "{}", ' \
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
                        flagged_dict["svm_seqchange_checked"], flagged_dict["afp_seqchange_checked"], flagged_dict["afp_seqchange_details"],
                        flagged_dict["svm_geneint_checked"], flagged_dict["afp_geneint_checked"], flagged_dict["afp_geneint_details"],
                        flagged_dict["svm_geneprod_checked"], flagged_dict["afp_geneprod_checked"], flagged_dict["afp_geneprod_details"],
                        flagged_dict["svm_genereg_checked"], flagged_dict["afp_genereg_checked"], flagged_dict["afp_genereg_details"],
                        flagged_dict["svm_newmutant_checked"], flagged_dict["afp_newmutant_checked"], flagged_dict["afp_newmutant_details"],
                        flagged_dict["svm_rnai_checked"], flagged_dict["afp_rnai_checked"], flagged_dict["afp_rnai_details"],
                        flagged_dict["svm_overexpr_checked"], flagged_dict["afp_overexpr_checked"], flagged_dict["afp_overexpr_details"])
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
                                            other_yn["afp_modchange_checked"], other_yn["afp_modchange_details"],
                                            other_yn["afp_newantibody_checked"], other_yn["afp_newantibody_details"],
                                            other_yn["afp_siteaction_checked"], other_yn["afp_siteaction_details"],
                                            other_yn["afp_timeaction_checked"], other_yn["afp_timeaction_details"],
                                            other_yn["afp_rnaseq_checked"], other_yn["afp_rnaseq_details"],
                                            other_yn["afp_chemphen_checked"], other_yn["afp_chemphen_details"],
                                            other_yn["afp_envpheno_checked"], other_yn["afp_envpheno_details"],
                                            other_yn["afp_catalyticact_checked"], other_yn["afp_catalyticact_details"],
                                            other_yn["afp_humdis_checked"], other_yn["afp_humdis_details"],
                                            other_yn["afp_additionalexpr"])
                    resp.status = falcon.HTTP_200
                elif req_type == "others":
                    others = self.db.get_other_data_types(paper_id)
                    resp.body = '{{"afp_newalleles": "{}", "afp_newstrains": "{}", "afp_newtransgenes": "{}", ' \
                                '"afp_otherantibodies": "{}"}}'.format(others["afp_newalleles"], others["afp_newstrains"],
                                                                       others["afp_newtransgenes"],
                                                                       others["afp_otherantibodies"])
                    resp.status = falcon.HTTP_200
                elif req_type == "comments":
                    comments = self.db.get_comments(paper_id)
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
                    list_papers_new_afp_full_sub = self.db.get_list_paper_ids_afp_submitted(
                        0, num_papers_new_afp_author_submitted)
                    list_papers_new_afp_processed = self.db.get_list_paper_ids_afp_processed(
                        0, num_papers_new_afp_processed)
                    num_papers_new_afp_partial_sub = self.db.get_num_papers_new_afp_partial_submissions()
                    list_papers_new_afp_partial_sub = self.db.get_list_papers_new_afp_partial_submissions(
                        0, num_papers_new_afp_partial_sub)
                    num_papers_new_afp_proc_no_sub = len(set(list_papers_new_afp_processed) -
                                                         (set(list_papers_new_afp_full_sub) |
                                                         set(list_papers_new_afp_partial_sub)))
                    num_extracted_genes_per_paper = self.db.get_num_entities_extracted_by_afp("genestudied")
                    num_extracted_species_per_paper = self.db.get_num_entities_extracted_by_afp("species")
                    num_extracted_alleles_per_paper = self.db.get_num_entities_extracted_by_afp("variation")
                    num_extracted_strains_per_paper = self.db.get_num_entities_extracted_by_afp("strain")
                    num_extracted_transgenes_per_paper = self.db.get_num_entities_extracted_by_afp("transgene")
                    resp.body = '{{"num_papers_new_afp_processed": "{}", "num_papers_old_afp_processed": "{}", ' \
                                '"num_papers_new_afp_author_submitted": "{}", "num_papers_old_afp_author_submitted": ' \
                                '"{}", "num_papers_new_afp_proc_no_sub": "{}", "num_papers_new_afp_partial_sub": ' \
                                '"{}", "num_extracted_genes_per_paper": {}, "num_extracted_species_per_paper": {}, ' \
                                '"num_extracted_alleles_per_paper": {}, "num_extracted_strains_per_paper": {}, ' \
                                '"num_extracted_transgenes_per_paper": {}}}'\
                        .format(num_papers_new_afp_processed, num_papers_old_afp_processed,
                                num_papers_new_afp_author_submitted, num_papers_old_afp_author_submitted,
                                num_papers_new_afp_proc_no_sub, num_papers_new_afp_partial_sub,
                                num_extracted_genes_per_paper, num_extracted_species_per_paper,
                                num_extracted_alleles_per_paper, num_extracted_strains_per_paper,
                                num_extracted_transgenes_per_paper)
                    resp.status = falcon.HTTP_200
                elif req_type == "papers":
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    list_type = req.media["list_type"]
                    if list_type == "processed":
                        num_papers = self.db.get_num_papers_new_afp_processed()
                        list_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                             self.db.get_list_paper_ids_afp_processed(from_offset, count)])
                    elif list_type == "submitted":
                        num_papers = self.db.get_num_papers_new_afp_author_submitted()
                        list_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                             self.db.get_list_paper_ids_afp_submitted(from_offset, count)])
                    elif list_type == "partial":
                        num_papers = self.db.get_num_papers_new_afp_partial_submissions()
                        list_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                             self.db.get_list_papers_new_afp_partial_submissions(from_offset, count)])
                    resp.body = '{{"list_ids": [{}], "total_num_ids": {}}}'.format(list_ids, num_papers)
                    resp.status = falcon.HTTP_200


class AFPReaderAuthorDash:
    def __init__(self, storage_engine: StorageEngine):
        self.db = storage_engine
        self.logger = logging.getLogger("AFP API for Author Dashboard")

    def on_post(self, req, resp, req_type):
        with self.db:
            if req_type == "send_link":
                if "email" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                email = req.media["email"]
                token = self.db.get_author_token_from_email(email)
                if token:
                    resp.body = '{{"token": "{}"}}'.format(token)
                    resp.status = falcon.HTTP_200
                else:
                    raise falcon.HTTPError(falcon.HTTP_NOT_FOUND)
            elif req_type == "get_processed_papers":
                from_offset = req.media["from"]
                count = req.media["count"]
                if "passwd" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                passwd = req.media["passwd"]
                processed = ",".join(["\"" + pap_id + "\"" for pap_id in
                                      self.db.get_papers_processed_from_auth_token(passwd, offset=from_offset,
                                                                                   count=count)])
                resp.body = '{{"paper_ids": [{}]}}'.format(processed)
                resp.status = falcon.HTTP_200
            elif req_type == "get_submitted_papers":
                from_offset = req.media["from"]
                count = req.media["count"]
                if "passwd" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                passwd = req.media["passwd"]
                submitted = ",".join(["\"" + pap_id + "\"" for pap_id in
                                      self.db.get_papers_submitted_from_auth_token(passwd, offset=from_offset,
                                                                                   count=count)])
                resp.body = '{{"paper_ids": [{}]}}'.format(submitted)
                resp.status = falcon.HTTP_200
            else:
                raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    parser.add_argument("-p", "--port", metavar="port", dest="port", type=int, help="API port")
    parser.add_argument("-a", "--admin-emails", metavar="admin_emails", dest="admin_emails", type=str, nargs="+",
                        help="list of email addresses of administrators")
    parser.add_argument("-e", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
    parser.add_argument("-u", "--afp-base-url", metavar="afp_base_url", dest="afp_base_url", type=str)
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

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

    app = falcon.API(middleware=[HandleCORS()])
    db = StorageEngine(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    writer = AFPWriter(storage_engine=db, admin_emails=args.admin_emails, email_passwd=args.email_passwd,
                       afp_base_url=args.afp_base_url)
    app.add_route('/api/write', writer)

    reader = AFPReader(storage_engine=db, admin_emails=args.admin_emails, email_passwd=args.email_passwd)
    app.add_route('/api/read', reader)

    reader = AFPReaderAdminLists(storage_engine=db, afp_base_url=args.afp_base_url)
    app.add_route('/api/read_admin/{req_type}', reader)

    reader_authdash = AFPReaderAuthorDash(storage_engine=db)
    app.add_route('/api/read_authdash/{req_type}', reader_authdash)

    httpd = simple_server.make_server('0.0.0.0', args.port, app)
    httpd.serve_forever()


if __name__ == '__main__':
    main()
