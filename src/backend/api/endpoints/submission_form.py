import logging
import os

import falcon
import urllib.parse

from typing import List
from urllib.request import urlopen

from wbtools.db.dbmanager import WBDBManager

from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import EmailManager

logger = logging.getLogger(__name__)


class PaperInfoReader:

    def __init__(self):
        self.base_url = os.getenv("PAPER_INFO_API", "https://caltech-curation.textpressolab.com/pub/cgi-bin/forms/textpresso/first_pass_api.cgi?action=jsonPaper")

    def on_get(self, req, resp):
        paper_id = req.params["paper"]
        paper_passwd = req.get_param("passwd")
        if not paper_id or not paper_passwd:
            raise falcon.HTTPBadRequest("Missing parameters", "Both 'paper' and 'passwd' parameters are required.")

        url = f"{self.base_url}&paper={paper_id}&passwd={paper_passwd}"
        try:
            data = urlopen(url)
            resp.body = data.read().decode('utf-8')
            resp.status = falcon.HTTP_200
        except Exception as e:
            logger.error(f"Error fetching paper data: {e}")
            raise falcon.HTTPInternalServerError("Error fetching paper data")


class AutocompleteReader:

    def __init__(self):
        self.base_url = os.getenv("AUTOCOMPLETE_API", "https://caltech-curation.textpressolab.com/pub/cgi-bin/forms/datatype_objects.cgi?action=autocompleteXHR")

    def on_get(self, req, resp):
        search_type = req.get_param("objectType")
        entity = req.get_param("userValue")
        if not search_type or not entity:
            raise falcon.HTTPBadRequest("Missing parameters", "Both 'objectType' and 'userValue' parameters are required.")

        url = f"{self.base_url}&objectType={search_type}&userValue={entity}"
        try:
            data = urlopen(url)
            resp.body = data.read().decode('utf-8')
            resp.status = falcon.HTTP_200
        except Exception as e:
            logger.error(f"Error fetching autocomplete data: {e}")
            raise falcon.HTTPInternalServerError("Error fetching autocomplete data")


class DiseaseAutocompleteReader:

    def __init__(self):
        # We'll use the Disease Ontology API or WormBase disease endpoint
        self.base_url = "https://www.disease-ontology.org/api/metadata/DOID"
        
    def on_get(self, req, resp):
        search_term = req.get_param("userValue")
        if not search_term:
            raise falcon.HTTPBadRequest("Missing parameter", "'userValue' parameter is required.")
        
        try:
            # First try WormBase disease endpoint
            wb_url = f"https://caltech-curation.textpressolab.com/pub/cgi-bin/forms/datatype_objects.cgi?action=autocompleteXHR&objectType=disease&userValue={search_term}"
            try:
                data = urlopen(wb_url)
                wb_results = data.read().decode('utf-8')
                if wb_results and wb_results.strip():
                    resp.body = wb_results
                    resp.status = falcon.HTTP_200
                    return
            except Exception:
                pass
            
            # If WormBase doesn't have results, try a simple list of common diseases
            # In production, this should query the Disease Ontology API
            common_diseases = [
                "Parkinson's disease",
                "Alzheimer's disease",
                "Huntington's disease",
                "Amyotrophic lateral sclerosis",
                "Multiple sclerosis",
                "Epilepsy",
                "Schizophrenia",
                "Autism spectrum disorder",
                "Depression",
                "Anxiety disorder",
                "Cancer",
                "Diabetes mellitus",
                "Cardiovascular disease",
                "Inflammatory bowel disease",
                "Rheumatoid arthritis"
            ]
            
            # Filter diseases based on search term
            search_lower = search_term.lower()
            matching_diseases = [d for d in common_diseases if search_lower in d.lower()]
            
            # Format response similar to WormBase autocomplete
            results = "\n".join(matching_diseases[:10])  # Limit to 10 results
            resp.body = results
            resp.status = falcon.HTTP_200
            
        except Exception as e:
            logger.error(f"Error fetching disease autocomplete data: {e}")
            raise falcon.HTTPInternalServerError("Error fetching disease autocomplete data")


class FeedbackFormReader:

    def __init__(self, db_manager: WBDBManager, admin_emails: List[str], email_passwd: str):
        self.db = db_manager
        self.admin_emails = admin_emails
        self.email_passwd = email_passwd

    def on_post(self, req, resp):
        with self.db:
            paper_id = self.db.afp.get_paper_id_from_passwd(req.media["passwd"]) if "passwd" in req.media else None
            if paper_id:
                logger.info("paper found")

                person_id = self.db.afp.get_latest_contributor_id(paper_id=paper_id)
                if person_id:
                    person_id = person_id.replace('two', '')
                else:
                    person_id = req.media["person_id"]

                if person_id:
                    fullname = self.db.person.get_fullname_from_personid(person_id="two" + person_id)
                    resp.body = '{{"fullname": "{}", "person_id": "{}"}}'.format(fullname, person_id)
                    resp.status = falcon.HTTP_200

            else:
                raise falcon.HTTPError(falcon.HTTP_401)


class FeedbackFormWriter:

    def __init__(self, db_manager: WBDBManager, admin_emails: List[str], email_passwd: str,
                 afp_base_url: str, test):
        self.db = db_manager
        self.logger = logging.getLogger("AFP API")
        self.admin_emails = admin_emails
        self.afp_base_url = afp_base_url
        config = load_config_from_file()
        self.email_manager = EmailManager(config=config, email_passwd=email_passwd)
        self.test = test

    def on_post(self, req, resp):
        paper_id = self.db.afp.get_paper_id_from_passwd(req.media["passwd"]) if "passwd" in req.media else None
        if paper_id:
            with self.db:
                self.logger.info("paper found")

                # overview
                if "gene_list" in req.media:
                    self.db.afp.set_gene_list(genes=req.media["gene_list"], paper_id=paper_id)
                    if self.db.afp.author_has_submitted(paper_id=paper_id):
                        person_id = req.media["person_id"]
                        self.db.afp.set_pap_gene_list(paper_id=paper_id, person_id=person_id)
                        self.db.afp.set_contributor(paper_id=paper_id, person_id=person_id)
                        self.db.afp.set_last_touched(paper_id=paper_id)

                if "gene_model_update" in req.media:
                    self.db.afp.set_gene_model_update(gene_model_update=req.media["gene_model_update"],
                                                      paper_id=paper_id)
                if "species_list" in req.media:
                    self.db.afp.set_submitted_species_list(species=req.media["species_list"], paper_id=paper_id)
                    if self.db.afp.author_has_submitted(paper_id=paper_id):
                        person_id = req.media["person_id"]
                        self.db.afp.set_pap_species_list(paper_id=paper_id, person_id=person_id)
                        self.db.afp.set_contributor(paper_id=paper_id, person_id=person_id)
                        self.db.afp.set_last_touched(paper_id=paper_id)

                if "other_species" in req.media:
                    self.db.afp.set_submitted_other_species(other_species=req.media["other_species"], paper_id=paper_id)

                # genetics
                if "alleles_list" in req.media:
                    self.db.afp.set_submitted_alleles_list(alleles=req.media["alleles_list"], paper_id=paper_id)
                if "allele_seq_change" in req.media:
                    self.db.afp.set_submitted_allele_seq_change(allele_seq_change=req.media["allele_seq_change"],
                                                                paper_id=paper_id)
                if "other_alleles" in req.media:
                    self.db.afp.set_submitted_other_alleles(other_alleles=req.media["other_alleles"], paper_id=paper_id)
                if "strains_list" in req.media:
                    self.db.afp.set_submitted_strains_list(strains=req.media["strains_list"], paper_id=paper_id)
                if "other_strains" in req.media:
                    self.db.afp.set_submitted_other_strains(other_strains=req.media["other_strains"], paper_id=paper_id)

                # reagent
                if "transgenes_list" in req.media:
                    self.db.afp.set_submitted_transgenes_list(transgenes=req.media["transgenes_list"],
                                                              paper_id=paper_id)
                if "new_transgenes" in req.media:
                    self.db.afp.set_submitted_new_transgenes(new_transgenes=req.media["new_transgenes"],
                                                             paper_id=paper_id)
                if "new_antibody" in req.media:
                    self.db.afp.set_submitted_new_antibody(new_antibody=req.media["new_antibody"], paper_id=paper_id)
                if "other_antibodies" in req.media:
                    self.db.afp.set_submitted_other_antibodies(other_antibodies=req.media["other_antibodies"],
                                                               paper_id=paper_id)

                # expression
                if "anatomic_expr" in req.media:
                    self.db.afp.set_submitted_anatomic_expr(anatomic_expr=req.media["anatomic_expr"], paper_id=paper_id)
                if "site_action" in req.media:
                    self.db.afp.set_submitted_site_action(site_action=req.media["site_action"], paper_id=paper_id)
                if "time_action" in req.media:
                    self.db.afp.set_submitted_time_action(time_action=req.media["time_action"], paper_id=paper_id)
                if "rnaseq" in req.media:
                    self.db.afp.set_submitted_rnaseq(rnaseq=req.media["rnaseq"], paper_id=paper_id)
                if "additional_expr" in req.media:
                    self.db.afp.set_submitted_additional_expr(additional_expr=req.media["additional_expr"],
                                                              paper_id=paper_id)

                # interactions
                if "gene_int" in req.media:
                    self.db.afp.set_submitted_gene_int(gene_int=req.media["gene_int"], paper_id=paper_id)
                if "phys_int" in req.media:
                    self.db.afp.set_submitted_phys_int(phys_int=req.media["phys_int"], paper_id=paper_id)
                if "gene_reg" in req.media:
                    self.db.afp.set_submitted_gene_reg(gene_reg=req.media["gene_reg"], paper_id=paper_id)

                # phenotypes
                if "allele_pheno" in req.media:
                    self.db.afp.set_submitted_allele_pheno(allele_pheno=req.media["allele_pheno"], paper_id=paper_id)
                if "rnai_pheno" in req.media:
                    self.db.afp.set_submitted_rnai_pheno(rnai_pheno=req.media["rnai_pheno"], paper_id=paper_id)
                if "transover_pheno" in req.media:
                    self.db.afp.set_submitted_transover_pheno(transover_pheno=req.media["transover_pheno"],
                                                              paper_id=paper_id)
                if "chemical" in req.media:
                    self.db.afp.set_submitted_chemical(chemical=req.media["chemical"], paper_id=paper_id)
                if "env" in req.media:
                    self.db.afp.set_submitted_env(env=req.media["env"], paper_id=paper_id)
                if "protein" in req.media:
                    self.db.afp.set_submitted_protein(protein=req.media["protein"], paper_id=paper_id)
                if "othergenefunc" in req.media:
                    self.db.afp.set_submitted_othergenefunc(othergenefunc=req.media["othergenefunc"], paper_id=paper_id)

                # disease
                if "disease" in req.media:
                    self.db.afp.set_submitted_disease(disease=req.media["disease"], paper_id=paper_id)

                # comments
                if "comments" in req.media:
                    self.db.afp.set_submitted_comments(comments=req.media["comments"], paper_id=paper_id)
                    self.db.afp.set_submitted_other_cc_contacts(other_cc_contacts=req.media["otherCCContacts"], paper_id=paper_id)
                    person_id = req.media["person_id"]
                    self.db.afp.set_pap_gene_list(paper_id=paper_id, person_id=person_id)
                    self.db.afp.set_pap_species_list(paper_id=paper_id, person_id=person_id)
                    self.db.afp.set_contributor(paper_id=paper_id, person_id=person_id)
                    self.db.afp.set_version(paper_id=paper_id)
                    self.db.afp.set_last_touched(paper_id=paper_id)
                    paper_title = self.db.paper.get_paper_title(paper_id)
                    paper_journal = self.db.paper.get_paper_journal(paper_id)
                    author_email = self.db.person.get_email(person_id)
                    doi = self.db.paper.get_doi(paper_id)
                    doi = doi if doi else ""
                    url = self.afp_base_url + "?paper=" + paper_id + "&passwd=" + req.media["passwd"] + "&title=" + \
                          urllib.parse.quote(paper_title) + "&journal=" + \
                          urllib.parse.quote(paper_journal) + "&pmid=" + \
                          self.db.paper.get_pmid(paper_id) + "&personid=" + \
                          req.media["person_id"][3:] + \
                          "&hide_genes=false&hide_alleles=false&hide_strains=false&doi=" + \
                          urllib.parse.quote(doi)
                    data = urlopen("http://tinyurl.com/api-create.php?url=" + urllib.parse.quote(url))
                    tiny_url = data.read().decode('utf-8')
                    dashboard_url = "https://dashboard.acknowledge.textpressolab.com/paper?paper_id=" + paper_id
                    self.email_manager.send_new_submission_notification_email_to_admin(paper_id, paper_title,
                                                                                       paper_journal, author_email,
                                                                                       self.admin_emails, dashboard_url,
                                                                                       tiny_url,
                                                                                       self.test)
                    self.email_manager.send_new_sub_thanks_email(
                        paper_id=paper_id, paper_title=paper_title, test=self.test,
                        recipients=([author_email] if not self.test else self.admin_emails))

                resp.body = '{"result": "success"}'
                resp.status = falcon.HTTP_200

        else:
            raise falcon.HTTPError(falcon.HTTP_401)
