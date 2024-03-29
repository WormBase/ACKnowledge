import logging

import falcon
from wbtools.db.dbmanager import WBDBManager

from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import EmailManager

logger = logging.getLogger(__name__)


class AuthorPapersPageReader:
    def __init__(self, db_manager: WBDBManager, email_passwd: str, afp_base_url: str):
        self.db = db_manager
        self.logger = logging.getLogger("AFP API for Author Dashboard")
        config = load_config_from_file()
        self.email_manager = EmailManager(config=config, email_passwd=email_passwd)
        self.afp_base_url = afp_base_url

    def on_post(self, req, resp, req_type):
        with self.db:
            if req_type == "send_link":
                if "email" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                email = req.media["email"]
                token = self.db.afp.get_author_token_from_email(email)
                if token:
                    self.email_manager.send_link_to_author_dashboard(token, [email])
                    resp.status = falcon.HTTP_200
                else:
                    raise falcon.HTTPError(falcon.HTTP_NOT_FOUND)
            elif req_type == "get_token_from_email":
                email = req.media["email"]
                token = self.db.afp.get_author_token_from_email(email)
                if token:
                    resp.body = '{{"token": "{}"}}'.format(token)
                    resp.status = falcon.HTTP_200
                else:
                    raise falcon.HTTPError(falcon.HTTP_NOT_FOUND)
            elif req_type == "is_token_valid":
                if "passwd" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                passwd = req.media["passwd"]
                token_valid = self.db.afp.is_token_valid(passwd)
                resp.body = '{{"token_valid": "{}"}}'.format(token_valid)
                resp.status = falcon.HTTP_200
            elif req_type == "get_processed_papers":
                from_offset = req.media["from"]
                count = req.media["count"]
                if "passwd" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                passwd = req.media["passwd"]
                processed = ",".join(["{\"paper_id\":" + "\"" + pap_id + "\", \"title\": \"" + self.db.paper.get_paper_title(
                    pap_id) + "\", \"afp_link\":\"" + self.db.afp.get_afp_form_link(pap_id, self.afp_base_url) + "\"}"
                                      for pap_id in self.db.afp.get_papers_waiting_sub_from_auth_token(
                        passwd, offset=from_offset, count=count)])
                num_papers = self.db.afp.get_num_papers_waiting_sub_from_auth_token(passwd)
                resp.body = '{{"list_ids": [{}], "total_num_ids": {}}}'.format(processed, num_papers)
                resp.status = falcon.HTTP_200
            elif req_type == "get_submitted_papers":
                from_offset = req.media["from"]
                count = req.media["count"]
                if "passwd" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                passwd = req.media["passwd"]
                submitted = ",".join(["{\"paper_id\":" + "\"" + pap_id + "\", \"title\": \"" + self.db.paper.get_paper_title(
                    pap_id) + "\", \"afp_link\":\"" + self.db.afp.get_afp_form_link(pap_id, self.afp_base_url) + "\"}"
                                      for pap_id in self.db.afp.get_papers_submitted_from_auth_token(
                    passwd, offset=from_offset, count=count)])
                num_papers = self.db.afp.get_num_papers_submitted_from_auth_token(passwd)
                resp.body = '{{"list_ids": [{}], "total_num_ids": {}}}'.format(submitted, num_papers)
                resp.status = falcon.HTTP_200
            elif req_type == "get_partial_papers":
                from_offset = req.media["from"]
                count = req.media["count"]
                if "passwd" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                passwd = req.media["passwd"]
                partial = ",".join(["{\"paper_id\":" + "\"" + pap_id + "\", \"title\": \"" + self.db.paper.get_paper_title(
                    pap_id) + "\", \"afp_link\":\"" + self.db.afp.get_afp_form_link(pap_id, self.afp_base_url) + "\"}"
                                      for pap_id in self.db.afp.get_papers_partial_from_auth_token(
                        passwd, offset=from_offset, count=count)])
                num_papers = self.db.afp.get_num_papers_partial_from_auth_token(passwd)
                resp.body = '{{"list_ids": [{}], "total_num_ids": {}}}'.format(partial, num_papers)
                resp.status = falcon.HTTP_200
            else:
                raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)