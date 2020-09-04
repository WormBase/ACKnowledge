import logging
import falcon
import urllib.parse

from typing import List
from urllib.request import urlopen
from src.backend.api.storagengin.feedback_form import FeedbackFormStorageEngine
from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import EmailManager

logger = logging.getLogger(__name__)


class FeedbackFormReader:

    def __init__(self, storage_engine: FeedbackFormStorageEngine, admin_emails: List[str], email_passwd: str):
        self.db = storage_engine
        self.admin_emails = admin_emails
        self.email_passwd = email_passwd

    def on_post(self, req, resp):
        with self.db:
            paper_id = self.db.get_paper_id_from_passwd(req.media["passwd"]) if "passwd" in req.media else None
            if paper_id:
                logger.info("paper found")

                person_id = self.db.get_contributor_id(paper_id=paper_id)
                if person_id:
                    person_id = person_id.replace('two', '')
                else:
                    person_id = req.media["person_id"]

                if "person_id" in req.media:
                    fullname = self.db.get_user_fullname_from_personid(person_id="two" + person_id)
                    resp.body = '{{"fullname": "{}", "person_id": "{}"}}'.format(fullname, person_id)
                    resp.status = falcon.HTTP_200

            else:
                raise falcon.HTTPError(falcon.HTTP_401)


class FeedbackFormWriter:

    def __init__(self, storage_engine: FeedbackFormStorageEngine, admin_emails: List[str], email_passwd: str,
                 afp_base_url: str, test):
        self.db = storage_engine
        self.logger = logging.getLogger("AFP API")
        self.admin_emails = admin_emails
        self.afp_base_url = afp_base_url
        config = load_config_from_file()
        self.email_manager = EmailManager(config=config, email_passwd=email_passwd)
        self.test = test

    def on_post(self, req, resp):
        with self.db:
            paper_id = self.db.get_paper_id_from_passwd(req.media["passwd"]) if "passwd" in req.media else None
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
                    author_email = self.db.get_paper_email(paper_id)
                    doi = self.db.get_doi_from_paper_id(paper_id)
                    url = self.afp_base_url + "?paper=" + paper_id + "&passwd=" + req.media["passwd"] + "&title=" + \
                                              urllib.parse.quote(paper_title) + "&journal=" + \
                                              urllib.parse.quote(paper_journal) + "&pmid=" + \
                                              self.db.get_pmid_from_paper_id(paper_id) + "&personid=" + \
                                              req.media["person_id"][3:] + \
                                              "&hide_genes=false&hide_alleles=false&hide_strains=false" + \
                                              urllib.parse.quote(doi)
                    data = urlopen("http://tinyurl.com/api-create.php?url=" + urllib.parse.quote(url))
                    tiny_url = data.read().decode('utf-8')
                    self.email_manager.send_new_submission_notification_email_to_admin(paper_id, paper_title,
                                                                                       paper_journal, author_email,
                                                                                       self.admin_emails, tiny_url,
                                                                                       self.test)
                resp.body = '{"result": "success"}'
                resp.status = falcon.HTTP_200

            else:
                raise falcon.HTTPError(falcon.HTTP_401)
