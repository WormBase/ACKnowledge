import logging

from src.backend.api.storagengin.afp_storage_engine import AFPStorageBaseEngine


logger = logging.getLogger(__name__)


class AuthorPapersPageStorageEngine(AFPStorageBaseEngine):

    def __init__(self, dbname, user, password, host, tazendra_user, tazendra_password):
        super().__init__(dbname, user, password, host, tazendra_user, tazendra_password)

    def get_author_token_from_email(self, email):
        return self.db_manager.get_author_token_from_email(email)

    def get_papers_processed_from_auth_token(self, token, offset, count):
        return self.db_manager.get_papers_processed_from_auth_token(token, offset, count)

    def get_papers_submitted_from_auth_token(self, token, offset, count):
        return self.db_manager.get_papers_submitted_from_auth_token(token, offset, count)

    def get_num_papers_processed_from_auth_token(self, token):
        return self.db_manager.get_num_papers_processed_from_auth_token(token)

    def get_num_papers_submitted_from_auth_token(self, token):
        return self.db_manager.get_num_papers_submitted_from_auth_token(token)

    def get_papers_partial_from_auth_token(self, token, offset, count):
        return self.db_manager.get_papers_partial_from_auth_token(token, offset, count)

    def get_num_papers_partial_from_auth_token(self, token):
        return self.db_manager.get_num_papers_partial_from_auth_token(token)

    def is_token_valid(self, token):
        return self.db_manager.is_token_valid(token)
