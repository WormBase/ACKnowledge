#!/usr/bin/env python3

import argparse
import logging
import falcon
from wsgiref import simple_server
from falcon import HTTPStatus
from wbtools.db.dbmanager import WBDBManager

from src.backend.api.endpoints.author_papers_page import AuthorPapersPageReader
from src.backend.api.endpoints.curator_dashboard import CuratorDashboardReader
from src.backend.api.endpoints.feedback_form import FeedbackFormWriter, FeedbackFormReader


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
    parser.add_argument("-w", "--tazendra-username", metavar="tazendra_user", dest="tazendra_user", type=str)
    parser.add_argument("-z", "--tazendra-password", metavar="tazendra_password", dest="tazendra_password", type=str)
    parser.add_argument("-d", "--dev-mode", dest="dev_mode", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    app = falcon.API(middleware=[HandleCORS()])
    db_manager = WBDBManager(dbname=args.db_name, host=args.db_host, password=args.db_password, user=args.db_user)
    feedback_form_writer = FeedbackFormWriter(db_manager=db_manager, admin_emails=args.admin_emails,
                                              email_passwd=args.email_passwd, afp_base_url=args.afp_base_url,
                                              test=args.dev_mode)
    app.add_route('/api/write', feedback_form_writer)
    feedback_form_reader = FeedbackFormReader(db_manager=db_manager, admin_emails=args.admin_emails,
                                              email_passwd=args.email_passwd)
    app.add_route('/api/read', feedback_form_reader)
    curator_dashboard_reader = CuratorDashboardReader(db_manager=db_manager,
                                                      afp_base_url=args.afp_base_url,
                                                      tazendra_username=args.tazendra_user,
                                                      tazendra_password=args.tazendra_password)
    app.add_route('/api/read_admin/{req_type}', curator_dashboard_reader)
    author_papers_reader = AuthorPapersPageReader(db_manager=db_manager, afp_base_url=args.afp_base_url,
                                                  email_passwd=args.email_passwd)
    app.add_route('/api/read_authdash/{req_type}', author_papers_reader)

    httpd = simple_server.make_server('0.0.0.0', args.port, app)
    httpd.serve_forever()


if __name__ == '__main__':
    main()

else:
    import os
    app = falcon.API(middleware=[HandleCORS()])
    db_manager = WBDBManager(dbname=os.environ['AFP_DB_NAME'], user=os.environ['AFP_DB_USER'],
                             password=os.environ['AFP_DB_PASSWD'], host=os.environ['AFP_DB_HOST'])
    feedback_form_writer = FeedbackFormWriter(db_manager=db_manager,
                                              admin_emails=os.environ['AFP_ADMIN_EMAILS'].split(','),
                                              email_passwd=os.environ['AFP_EMAIL_PASSWD'],
                                              afp_base_url=os.environ['AFP_BASE_URL'], test=False)
    app.add_route('/api/write', feedback_form_writer)
    feedback_form_reader = FeedbackFormReader(db_manager=db_manager,
                                              admin_emails=os.environ['AFP_ADMIN_EMAILS'].split(','),
                                              email_passwd=os.environ['AFP_EMAIL_PASSWD'])
    app.add_route('/api/read', feedback_form_reader)
    curator_dashboard_reader = CuratorDashboardReader(db_manager=db_manager,
                                                      afp_base_url=os.environ['AFP_BASE_URL'],
                                                      tazendra_username=os.environ['TAZENDRA_USER'],
                                                      tazendra_password=os.environ['TAZENDRA_PASSWORD'])
    app.add_route('/api/read_admin/{req_type}', curator_dashboard_reader)
    author_papers_reader = AuthorPapersPageReader(db_manager=db_manager,
                                                  afp_base_url=os.environ['AFP_BASE_URL'],
                                                  email_passwd=os.environ['AFP_EMAIL_PASSWD'])
    app.add_route('/api/read_authdash/{req_type}', author_papers_reader)
