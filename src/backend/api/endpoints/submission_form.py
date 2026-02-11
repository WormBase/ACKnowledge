import logging
import os
import json

import falcon
import urllib.parse

from typing import List
from urllib.request import urlopen

from wbtools.db.dbmanager import WBDBManager

from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import EmailManager
from src.backend.common.google_drive_service import GoogleDriveService

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

        url = f"{self.base_url}&objectType={urllib.parse.quote(search_type)}&userValue={urllib.parse.quote(entity)}"
        try:
            data = urlopen(url)
            resp.body = data.read().decode('utf-8')
            resp.status = falcon.HTTP_200
        except Exception as e:
            logger.error(f"Error fetching autocomplete data: {e}")
            raise falcon.HTTPInternalServerError("Error fetching autocomplete data")


class DiseaseAutocompleteReader:

    def __init__(self):
        self.base_url = os.getenv("AUTOCOMPLETE_API", "https://caltech-curation.textpressolab.com/pub/cgi-bin/forms/datatype_objects.cgi?action=autocompleteXHR")

    def on_get(self, req, resp):
        search_term = req.get_param("userValue")
        if not search_term:
            raise falcon.HTTPBadRequest("Missing parameter", "'userValue' parameter is required.")

        url = f"{self.base_url}&objectType=humandoid&userValue={urllib.parse.quote(search_term)}"
        try:
            data = urlopen(url)
            resp.body = data.read().decode('utf-8')
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
                logger.info(f"Paper found: {paper_id}")

                person_id = self.db.afp.get_latest_contributor_id(paper_id=paper_id)
                if person_id:
                    person_id = person_id.replace('two', '')
                else:
                    person_id = req.media.get("person_id")

                if person_id:
                    fullname = self.db.person.get_fullname_from_personid(person_id="two" + person_id)
                    if fullname and fullname != "Unknown user":
                        logger.info(f"User identified: {fullname} (WBPerson{person_id}) for paper {paper_id}")
                        resp.body = json.dumps({"fullname": fullname, "person_id": person_id})
                    else:
                        logger.warning(
                            f"User not found for person_id WBPerson{person_id}, paper {paper_id}"
                        )
                        resp.body = json.dumps({"fullname": None, "person_id": None,
                                                "error": "user_not_found"})
                else:
                    logger.warning(f"No person_id provided or found for paper {paper_id}")
                    resp.body = json.dumps({"fullname": None, "person_id": None,
                                            "error": "user_not_found"})
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
                        person_id = req.media.get("person_id", "")
                        self.db.afp.set_pap_gene_list(paper_id=paper_id, person_id=person_id)
                        self.db.afp.set_contributor(paper_id=paper_id, person_id=person_id)
                        self.db.afp.set_last_touched(paper_id=paper_id)

                if "gene_model_update" in req.media:
                    self.db.afp.set_gene_model_update(gene_model_update=req.media["gene_model_update"],
                                                      paper_id=paper_id)
                if "species_list" in req.media:
                    self.db.afp.set_submitted_species_list(species=req.media["species_list"], paper_id=paper_id)
                    if self.db.afp.author_has_submitted(paper_id=paper_id):
                        person_id = req.media.get("person_id", "")
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
                    # Create structured JSON for disease data
                    disease_value = req.media["disease"]
                    comment = disease_value if disease_value != "Checked" and disease_value != "" else ""
                    diseases = req.media.get("disease_list", []) if isinstance(req.media.get("disease_list"), list) else []
                    disease_data = {
                        "checked": disease_value != "" and disease_value != "Checked",
                        "comment": comment,
                        "diseases": diseases
                    }
                    self.db.afp.set_submitted_disease(disease=json.dumps(disease_data), paper_id=paper_id)

                # comments
                if "comments" in req.media:
                    person_id = req.media.get("person_id", "")
                    if not person_id:
                        self.logger.error(f"Submission attempted without person_id for paper {paper_id}")
                        raise falcon.HTTPBadRequest(
                            title="Missing person_id",
                            description="A valid user identity is required to submit."
                        )
                    self.db.afp.set_submitted_comments(comments=req.media["comments"], paper_id=paper_id)
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
                          person_id[3:] + \
                          "&hide_genes=false&hide_alleles=false&hide_strains=false&doi=" + \
                          urllib.parse.quote(doi)
                    data = urlopen("http://tinyurl.com/api-create.php?url=" + urllib.parse.quote(url))
                    tiny_url = data.read().decode('utf-8')
                    dashboard_url = "https://dashboard.acknowledge.textpressolab.com/paper?paper_id=" + paper_id
                    self.logger.info(
                        f"Submission received for paper {paper_id} by person_id {person_id}, "
                        f"email: {author_email}, form_url: {tiny_url}, dashboard: {dashboard_url}"
                    )
                    self.email_manager.send_new_submission_notification_email_to_admin(paper_id, paper_title,
                                                                                       paper_journal, author_email,
                                                                                       self.admin_emails, dashboard_url,
                                                                                       tiny_url,
                                                                                       self.test)
                    # Get all author emails for the paper
                    all_author_emails_result = self.db.afp.get_contact_emails(paper_id)
                    if all_author_emails_result:
                        # Check if result is already a list or a string
                        if isinstance(all_author_emails_result, list):
                            all_author_emails = [email.strip() for email in all_author_emails_result if email and email.strip()]
                        else:
                            # It's a string, split it
                            all_author_emails = [email.strip() for email in all_author_emails_result.split(" | ")]
                            # Remove any empty strings
                            all_author_emails = [email for email in all_author_emails if email]
                    else:
                        # If no emails found in afp table, at least send to the current author
                        all_author_emails = [author_email] if author_email else []
                    
                    # Separate the submitting author from coauthors
                    coauthor_emails = [email for email in all_author_emails if email != author_email]
                    
                    # Get submitter's name for the coauthor notification
                    person_id = req.media.get("person_id", "")
                    
                    # Log for debugging
                    self.logger.info(f"Getting submitter name for person_id: {person_id}")
                    
                    # person_id from frontend already includes "two" prefix
                    submitter_name = self.db.person.get_fullname_from_personid(person_id)
                    
                    # Log the result
                    self.logger.info(f"Submitter name from DB: {submitter_name}")
                    
                    # If name not found or is None/empty, use fallback
                    if not submitter_name or submitter_name == "Unknown user" or submitter_name.strip() == "":
                        self.logger.warning(f"Could not get submitter name for person_id {person_id}, using email as fallback")
                        submitter_name = author_email or "Unknown author"
                    
                    # Send thank you email to the submitting author
                    if author_email:
                        self.email_manager.send_new_sub_thanks_email(
                            paper_id=paper_id, paper_title=paper_title, test=self.test,
                            recipients=([author_email] if not self.test else self.admin_emails))
                    else:
                        self.logger.warning(
                            f"No email found for person_id {person_id}, skipping thank you email"
                        )
                        self.email_manager.send_user_error_notification(
                            error_type="Missing Author Email",
                            paper_id=paper_id,
                            person_id=person_id,
                            details="Author email is missing. Thank you email was not sent.",
                            recipients=self.admin_emails,
                            test=self.test
                        )

                    # Send notification email to coauthors (if any)
                    if coauthor_emails and not self.test:
                        self.email_manager.send_coauthor_notification_email(
                            paper_id=paper_id, paper_title=paper_title, submitter_name=submitter_name,
                            recipients=coauthor_emails, test=self.test)
                    elif self.test and coauthor_emails:
                        # In test mode, send to admin emails
                        self.email_manager.send_coauthor_notification_email(
                            paper_id=paper_id, paper_title=paper_title, submitter_name=submitter_name,
                            recipients=self.admin_emails, test=self.test)

                resp.body = '{"result": "success"}'
                resp.status = falcon.HTTP_200

        else:
            raise falcon.HTTPError(falcon.HTTP_401)


class AllelesSpreadsheetCreator:

    def __init__(self, db_manager: WBDBManager):
        self.db = db_manager
        self.logger = logging.getLogger("AFP API")
        try:
            self.google_drive_service = GoogleDriveService()
            # Validate credentials on startup
            if not self.google_drive_service.validate_credentials():
                self.logger.error("Google Drive credentials validation failed")
                self.google_drive_service = None
        except Exception as e:
            self.logger.error(f"Failed to initialize Google Drive service: {e}")
            self.google_drive_service = None

    def on_post(self, req, resp):
        if not self.google_drive_service:
            raise falcon.HTTPInternalServerError(
                title="Google Drive Service Unavailable",
                description="Google Drive integration is not properly configured"
            )

        # Validate required parameters
        if not req.media or 'passwd' not in req.media:
            raise falcon.HTTPBadRequest("Missing parameters", "Paper password is required")

        paper_id = self.db.afp.get_paper_id_from_passwd(req.media["passwd"])
        if not paper_id:
            raise falcon.HTTPError(falcon.HTTP_401, title="Unauthorized", description="Invalid paper password")

        with self.db:
            try:
                # Get paper information
                paper_title = self.db.paper.get_paper_title(paper_id) or "Unknown Title"
                pmid = self.db.paper.get_pmid(paper_id) or ""
                
                # Get author information
                person_id = req.media.get("person_id", "")
                # Use person_name from request if provided (preferred for logged-in user)
                author_name = req.media.get("person_name", "")
                
                # Fallback to database lookup if no name provided
                if not author_name and person_id:
                    fullname = self.db.person.get_fullname_from_personid("two" + person_id)
                    if fullname:
                        author_name = fullname
                    else:
                        # Fallback to email if name not found
                        author_email = self.db.person.get_email(person_id)
                        if author_email:
                            author_name = author_email
                
                # Final fallback
                if not author_name:
                    author_name = "Unknown Author"

                # Create folder and spreadsheet
                folder_id = self.google_drive_service.create_or_get_paper_folder(paper_id)
                spreadsheet_url = self.google_drive_service.create_alleles_spreadsheet(
                    folder_id, paper_id, paper_title, author_name, pmid
                )

                self.logger.info(f"Created alleles spreadsheet for paper {paper_id}")
                
                resp.body = json.dumps({
                    'spreadsheet_url': spreadsheet_url,
                    'paper_id': paper_id,
                    'success': True
                })
                resp.status = falcon.HTTP_200

            except Exception as e:
                self.logger.error(f"Error creating alleles spreadsheet for paper {paper_id}: {e}")
                raise falcon.HTTPInternalServerError(
                    title="Spreadsheet Creation Failed",
                    description="Failed to create Google Spreadsheet. Please try again later."
                )


class StrainsSpreadsheetCreator:
    """Endpoint to create strains spreadsheet in Google Drive."""
    
    def __init__(self, db_manager: WBDBManager):
        self.logger = logging.getLogger(__name__)
        self.db = db_manager
        self.google_drive_service = GoogleDriveService()
    
    def on_post(self, req, resp):
        """Create a strains spreadsheet for a paper."""
        if not self.google_drive_service.validate_credentials():
            raise falcon.HTTPServiceUnavailable(
                title="Service Unavailable",
                description="Google Drive integration is not properly configured"
            )

        # Validate required parameters
        if not req.media or 'passwd' not in req.media:
            raise falcon.HTTPBadRequest("Missing parameters", "Paper password is required")

        paper_id = self.db.afp.get_paper_id_from_passwd(req.media["passwd"])
        if not paper_id:
            raise falcon.HTTPError(falcon.HTTP_401, title="Unauthorized", description="Invalid paper password")

        with self.db:
            try:
                # Get paper information
                paper_title = self.db.paper.get_paper_title(paper_id) or "Unknown Title"
                pmid = self.db.paper.get_pmid(paper_id) or ""
                
                # Get author information
                person_id = req.media.get("person_id", "")
                # Use person_name from request if provided (preferred for logged-in user)
                author_name = req.media.get("person_name", "")
                
                # Fallback to database lookup if no name provided
                if not author_name and person_id:
                    fullname = self.db.person.get_fullname_from_personid("two" + person_id)
                    if fullname:
                        author_name = fullname
                    else:
                        # Fallback to email if name not found
                        author_email = self.db.person.get_email(person_id)
                        if author_email:
                            author_name = author_email
                
                # Final fallback
                if not author_name:
                    author_name = "Unknown Author"

                # Create folder and spreadsheet
                folder_id = self.google_drive_service.create_or_get_paper_folder(paper_id)
                spreadsheet_url = self.google_drive_service.create_strains_spreadsheet(
                    folder_id, paper_id, paper_title, author_name, pmid
                )

                self.logger.info(f"Created strains spreadsheet for paper {paper_id}")
                
                resp.body = json.dumps({
                    'spreadsheet_url': spreadsheet_url,
                    'paper_id': paper_id,
                    'success': True
                })
                resp.status = falcon.HTTP_200

            except Exception as e:
                self.logger.error(f"Error creating strains spreadsheet for paper {paper_id}: {e}")
                raise falcon.HTTPInternalServerError(
                    title="Spreadsheet Creation Failed",
                    description="Failed to create Google Spreadsheet. Please try again later."
                )


class TransgenesSpreadsheetCreator:
    """Endpoint to create transgenes spreadsheet in Google Drive."""

    def __init__(self, db_manager: WBDBManager):
        self.logger = logging.getLogger(__name__)
        self.db = db_manager
        try:
            self.google_drive_service = GoogleDriveService()
            # Validate credentials on startup
            if not self.google_drive_service.validate_credentials():
                self.logger.error("Google Drive credentials validation failed")
                self.google_drive_service = None
        except Exception as e:
            self.logger.error(f"Failed to initialize Google Drive service: {e}")
            self.google_drive_service = None

    def on_post(self, req, resp):
        if not self.google_drive_service:
            raise falcon.HTTPInternalServerError(
                title="Google Drive Service Unavailable",
                description="Google Drive integration is not properly configured"
            )

        # Validate required parameters
        if not req.media or 'passwd' not in req.media:
            raise falcon.HTTPBadRequest("Missing parameters", "Paper password is required")

        paper_id = self.db.afp.get_paper_id_from_passwd(req.media["passwd"])
        if not paper_id:
            raise falcon.HTTPError(falcon.HTTP_401, title="Unauthorized", description="Invalid paper password")

        with self.db:
            try:
                # Get paper information
                paper_title = self.db.paper.get_paper_title(paper_id) or "Unknown Title"
                pmid = self.db.paper.get_pmid(paper_id) or ""

                # Get author information
                person_id = req.media.get("person_id", "")
                # Use person_name from request if provided (preferred for logged-in user)
                author_name = req.media.get("person_name", "")

                # Fallback to database lookup if no name provided
                if not author_name and person_id:
                    fullname = self.db.person.get_fullname_from_personid("two" + person_id)
                    if fullname:
                        author_name = fullname
                    else:
                        # Fallback to email if name not found
                        author_email = self.db.person.get_email(person_id)
                        if author_email:
                            author_name = author_email

                # Final fallback
                if not author_name:
                    author_name = "Unknown Author"

                # Create folder and spreadsheet
                folder_id = self.google_drive_service.create_or_get_paper_folder(paper_id)
                spreadsheet_url = self.google_drive_service.create_transgenes_spreadsheet(
                    folder_id, paper_id, paper_title, author_name, pmid
                )

                self.logger.info(f"Created transgenes spreadsheet for paper {paper_id}")

                resp.body = json.dumps({
                    'spreadsheet_url': spreadsheet_url,
                    'paper_id': paper_id,
                    'success': True
                })
                resp.status = falcon.HTTP_200

            except Exception as e:
                self.logger.error(f"Error creating transgenes spreadsheet for paper {paper_id}: {e}")
                raise falcon.HTTPInternalServerError(
                    title="Spreadsheet Creation Failed",
                    description="Failed to create Google Spreadsheet. Please try again later."
                )
