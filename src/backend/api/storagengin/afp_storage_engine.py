from src.backend.dbmanager import DBManager


class AFPStorageBaseEngine(object):

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
