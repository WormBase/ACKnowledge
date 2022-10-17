import logging
import smtplib
import urllib.parse

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List
from urllib.request import urlopen


logger = logging.getLogger(__name__)


class EmailManager(object):

    def __init__(self, config, email_passwd):
        self.from_addr = config["emails"]["from_address"]
        self.reply_to_addr = config["emails"]["reply_to_address"]
        self.content_email_to_author = config["emails"]["content_to_author"]
        self.subject_email_to_author = config["emails"]["subject_to_author"]
        self.content_email_empty = config["emails"]["content_empty"]
        self.subject_email_empty = config["emails"]["subject_empty"]
        self.content_email_summary = config["emails"]["content_summary"]
        self.subject_email_summary = config["emails"]["subject_summary"]
        self.content_email_new_sub = config["emails"]["content_new_sub"]
        self.subject_email_new_sub = config["emails"]["subject_new_sub"]
        self.content_email_digest = config["emails"]["content_digest_alert"]
        self.subject_email_digest = config["emails"]["subject_digest_alert"]
        self.content_email_author_dash = config["emails"]["content_author_dash"]
        self.subject_email_author_dash = config["emails"]["subject_author_dash"]
        self.content_email_reminder = config["emails"]["content_reminder"]
        self.subject_email_reminder = config["emails"]["subject_reminder"]
        self.content_email_new_sub_thanks = config["emails"]["content_new_sub_thanks"]
        self.subject_email_new_sub_thanks = config["emails"]["subject_new_sub_thanks"]
        self.email_user = config["emails"]["email_user"]
        self.email_user = config["emails"]["email_user"]
        self.server_host = config["emails"]["server_host"]
        self.server_port = config["emails"]["server_port"]
        self.email_passwd = email_passwd

    def send_email(self, subject, content, recipients):
        msg_alternative = MIMEMultipart('alternative')
        msg_root = MIMEMultipart('related')
        msg_root.attach(msg_alternative)
        body_image = MIMEText(content + "<br/><br/><a href='https://wormbase.github.io/ACKnowledge/'><img src='https://github.com/WormBase/ACKnowledge/raw/develop/src/backend/images/lockup-without-rule-color-100.jpg' height='100px'></a>", "html")
        msg_alternative.attach(body_image)
        msg_root['Subject'] = subject
        msg_root['From'] = self.from_addr
        msg_root['reply-to'] = self.reply_to_addr
        msg_root['To'] = ", ".join(recipients)

        try:
            server_ssl = smtplib.SMTP_SSL(self.server_host, self.server_port)
            server_ssl.login(self.email_user, self.email_passwd)
            server_ssl.sendmail(self.from_addr, ", ".join(recipients), msg_root.as_string())
            logger.info("Email sent to: " + ", ".join(recipients))
            server_ssl.quit()
        except Exception as e:
            logger.fatal("Can't connect to smtp server. AFP emails not sent.")

    def send_email_to_author(self, paper_id, paper_title: str, paper_journal: str, afp_link, recipients: List[str]):
        content = self.content_email_to_author.format(paper_title, paper_journal, afp_link)
        subject = self.subject_email_to_author.format(paper_id)
        self.send_email(subject=subject, content=content, recipients=recipients)

    def notify_admin_of_paper_without_entities(self, paper_id, paper_title: str, paper_journal: str, afp_link,
                                               recipients: List[str]):
        content = self.content_email_empty.format(paper_title, paper_journal, afp_link)
        subject = self.subject_email_empty.format(paper_id)
        self.send_email(subject=subject, content=content, recipients=recipients)

    def send_summary_email_to_admin(self, urls, paper_ids, recipients: List[str]):
        if paper_ids:
            paperid_list = "<br/>".join(["<a href=" + url + ">" + paper_id + "</a>" for paper_id, url in
                                         zip(paper_ids, urls)])
        else:
            paperid_list = "No papers processed this time"
        content = self.content_email_summary.format(paperid_list)
        self.send_email(subject=self.subject_email_summary, content=content, recipients=recipients)

    def send_new_submission_notification_email_to_admin(self, paper_id, paper_title, paper_journal, paper_email,
                                                        recipients: List[str], dashboard_url, form_url,
                                                        test: bool = False):
        content = self.content_email_new_sub.format(paper_id, paper_title, paper_journal, paper_email,
                                                    dashboard_url, form_url)
        subject = self.subject_email_new_sub
        if test:
            subject = "[Dev Test] " + subject
        self.send_email(subject=subject, content=content, recipients=recipients)

    def send_new_data_notification_email_to_watcher(self, data_type_table, paper_ids_val, recipients):
        content = self.content_email_digest.format(data_type_table, "<br/>".join(
            ["<a href='https://dashboard.afp.textpressolab.com/paper?paper_id=" + paper_id + "'>" + paper_id + "</a>:  " +
             paper_ids_val[paper_id] for paper_id in paper_ids_val.keys()]))
        subject = self.subject_email_digest.format(data_type_table)
        self.send_email(subject=subject, content=content, recipients=recipients)

    def send_link_to_author_dashboard(self, token, recipients):
        content = self.content_email_author_dash.format(token, token)
        self.send_email(subject=self.subject_email_author_dash, content=content, recipients=recipients)

    def send_reminder_to_author(self, paper_id, paper_title: str, paper_journal: str, afp_link, recipients: List[str],
                                final_call: bool = False):
        final_text = "Note that after one week’s time, partial submissions will be checked and entered into WormBase " \
                     "by one of our curators." if final_call else ""

        content = self.content_email_reminder.format(paper_title, paper_journal, afp_link, final_text)
        subject = self.subject_email_reminder.format(paper_id)
        self.send_email(subject=subject, content=content, recipients=recipients)

    @staticmethod
    def get_feedback_form_tiny_url(afp_base_url, paper_id, genes, alleles, strains, passwd, title, journal, pmid,
                                   corresponding_author_id, doi):
        doi = doi if doi else ""
        title = title if title else ""
        journal = journal if journal else ""
        hide_genes = "true" if len(genes) > 100 else "false"
        hide_alleles = "true" if len(alleles) > 100 else "false"
        hide_strains = "true" if len(strains) > 100 else "false"
        url = afp_base_url + "?paper=" + paper_id + "&passwd=" + str(passwd) + "&title=" + \
              urllib.parse.quote(title) + "&journal=" + urllib.parse.quote(journal) + "&pmid=" + \
              pmid + "&personid=" + corresponding_author_id.replace("two", "") + "&hide_genes=" + \
              hide_genes + "&hide_alleles=" + hide_alleles + "&hide_strains=" + hide_strains + "&doi=" + \
              urllib.parse.quote(doi)
        # Stopped using tinyurl after too many issues with the free api
        # data = urlopen("http://tinyurl.com/api-create.php?url=" + urllib.parse.quote(url))
        # return data.read().decode('utf-8')
        return url

    def send_new_sub_thanks_email(self, paper_id, paper_title, recipients: List[str], test: bool = False):
        content = self.content_email_new_sub_thanks.format(paper_title, paper_id)
        subject = self.subject_email_new_sub_thanks
        if test:
            subject = "[Dev Test] " + subject
        self.send_email(subject=subject, content=content, recipients=recipients)


