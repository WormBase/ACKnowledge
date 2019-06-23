#!/usr/bin/env python3

import argparse
import logging
import falcon
from wsgiref import simple_server
from falcon import HTTPStatus

from src.backend.api.endpoints.author_papers_page import AuthorPapersPageReader
from src.backend.api.endpoints.curator_dashboard import CuratorDashboardReader
from src.backend.api.endpoints.feedback_form import FeedbackFormWriter, FeedbackFormReader
from src.backend.api.storagengin.author_papers_page import AuthorPapersPageStorageEngine
from src.backend.api.storagengin.curator_dashboard import CuratorDashboardStorageEngine
from src.backend.api.storagengin.feedback_form import FeedbackFormStorageEngine


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
    feedback_form_db = FeedbackFormStorageEngine(dbname=args.db_name, user=args.db_user, password=args.db_password,
                                                 host=args.db_host)
    feedback_form_writer = FeedbackFormWriter(storage_engine=feedback_form_db, admin_emails=args.admin_emails,
                                              email_passwd=args.email_passwd, afp_base_url=args.afp_base_url)
    app.add_route('/api/write', feedback_form_writer)

    feedback_form_reader = FeedbackFormReader(storage_engine=feedback_form_db, admin_emails=args.admin_emails,
                                              email_passwd=args.email_passwd)
    app.add_route('/api/read', feedback_form_reader)

    curator_dashboard_db = CuratorDashboardStorageEngine(dbname=args.db_name, user=args.db_user,
                                                         password=args.db_password, host=args.db_host)
    curator_dashboard_reader = CuratorDashboardReader(storage_engine=curator_dashboard_db,
                                                      afp_base_url=args.afp_base_url)
    app.add_route('/api/read_admin/{req_type}', curator_dashboard_reader)

    author_papers_db = AuthorPapersPageStorageEngine(dbname=args.db_name, user=args.db_user, password=args.db_password,
                                                     host=args.db_host)
    author_papers_reader = AuthorPapersPageReader(storage_engine=author_papers_db, afp_base_url=args.afp_base_url)
    app.add_route('/api/read_authdash/{req_type}', author_papers_reader)

    httpd = simple_server.make_server('0.0.0.0', args.port, app)
    httpd.serve_forever()


if __name__ == '__main__':
    main()
