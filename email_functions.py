import logging
import smtplib

from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List


def send_email_to_author(paper_id, paper_title: str, paper_journal: str, afp_link, recipients: List[str], email_passwd):
    email_content = """Dear Author,
  
We have identified you as the corresponding author for the recently published paper:

\"{}\", {}

We are contacting you for help in alerting a WormBase curator to data that need to be extracted 
from your paper and entered into our database.

If you would like to flag* your paper for detailed curation, please visit: 
{}

*Flagging your paper involves identifying the types of data present and should take <10 minutes.

In addition, WormBase has recently launched Micropublication:biology, a peer-reviewed journal 
that publishes citable, single experimental results, such as those often omitted from standard 
journal articles due to space constraints or confirmatory or negative results. If you have such 
unpublished data generated during this study, we encourage you to submit it at 
http://bit.ly/2BcFas0.

Please contact help@wormbase.org or contact@micropublication.org if you would like more 
information about flagging your paper for curation or Micropublication.
Please accept our congratulations on your publication!
Best Wishes,
WormBase""".format(paper_title, paper_journal, afp_link)

    msg = EmailMessage()
    msg.set_content(email_content)
    msg['Subject'] = "Help Wormbase curate your paper WBPaper" + paper_id
    msg['From'] = "WormBase Outreach<outreach@wormbase.org>"
    msg['To'] = ", ".join(recipients)

    gmail_user = "outreach@wormbase.org"
    gmail_password = email_passwd
    logger = logging.getLogger("AFP Email module")
    try:
        server_ssl = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server_ssl.login(gmail_user, gmail_password)
        server_ssl.send_message(msg)
        logger.info("Email sent to: " + ", ".join(recipients))
        server_ssl.quit()
    except:
        logger.fatal("Can't connect to smtp server. AFP emails not sent.")


def notify_admin_of_paper_without_entities(paper_id, paper_title: str, paper_journal: str, afp_link,
                                           recipients: List[str], email_passwd):
    email_content = """The paper:

\"{}\", {}

has empty entity lists.

This is the link to the form for the paper: 
{}

""".format(paper_title, paper_journal, afp_link)

    msg = EmailMessage()
    msg.set_content(email_content)
    msg['Subject'] = "Paper prcessed by AFP has empty entity lists: WBPaper" + paper_id
    msg['From'] = "WormBase Outreach<outreach@wormbase.org>"
    msg['To'] = ", ".join(recipients)

    gmail_user = "outreach@wormbase.org"
    gmail_password = email_passwd
    logger = logging.getLogger("AFP Email module")
    try:
        server_ssl = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server_ssl.login(gmail_user, gmail_password)
        server_ssl.send_message(msg)
        logger.info("Email sent to: " + ", ".join(recipients))
        server_ssl.quit()
    except:
        logger.fatal("Can't connect to smtp server. AFP emails not sent.")


def send_summary_email_to_admin(urls, paper_ids, recipients: List[str], email_passwd):
    email_content = """New papers processed by the Author First Pass Pipeline:

{}

""".format("\n".join([paper_id + " " + url for paper_id, url in zip(paper_ids, urls)]))

    msg = EmailMessage()
    msg.set_content(email_content)
    msg['Subject'] = "New papers processed by AFP Pipeline"
    msg['From'] = "WormBase Outreach<outreach@wormbase.org>"
    msg['To'] = ", ".join(recipients)

    gmail_user = "outreach@wormbase.org"
    gmail_password = email_passwd
    logger = logging.getLogger("AFP Email module")
    try:
        server_ssl = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server_ssl.login(gmail_user, gmail_password)
        server_ssl.send_message(msg)
        logger.info("Email sent to: " + ", ".join(recipients))
        server_ssl.quit()
    except:
        logger.fatal("Can't connect to smtp server. AFP emails not sent.")


def send_new_submission_notification_email_to_admin(paper_id, paper_passwd, paper_title, paper_journal,
                                                    recipients: List[str], email_passwd, form_url):
    email_content = """New AFP data submission completed by author for the following paper:
    
Paper ID: {}
Title: {}
Journal: {}

Link to AFP form: {}

""".format(paper_id, paper_title, paper_journal, form_url)

    msg = EmailMessage()
    msg.set_content(email_content)
    msg['Subject'] = "New AFP data submitted by author"
    msg['From'] = "WormBase Outreach<outreach@wormbase.org>"
    msg['To'] = ", ".join(recipients)

    gmail_user = "outreach@wormbase.org"
    gmail_password = email_passwd
    logger = logging.getLogger("AFP Email module")
    try:
        server_ssl = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server_ssl.login(gmail_user, gmail_password)
        server_ssl.send_message(msg)
        logger.info("Email sent to: " + ", ".join(recipients))
        server_ssl.quit()
    except:
        logger.fatal("Can't connect to smtp server. AFP emails not sent.")


def send_new_data_notification_email_to_watcher(data_type_table, paper_ids_val, recipients, email_passwd):
    email_content = """New papers flagged 'positive' during the last month for data type {}: <br/><br>
    
{}

""".format(data_type_table, "<br/>".join(["<a href='http://textpressocentral.org:5001/paper?paper_id=" +
                                          paper_id + "'>" + paper_id + "</a>:  " + paper_ids_val[paper_id] for paper_id
                                          in paper_ids_val.keys()]))

    body = MIMEText(email_content, "html")
    msg = MIMEMultipart('alternative')
    msg.attach(body)
    msg['Subject'] = "New positive papers flagged by author through AFP for " + data_type_table
    msg['From'] = "WormBase Outreach<outreach@wormbase.org>"
    msg['To'] = ", ".join(recipients)

    gmail_user = "outreach@wormbase.org"
    gmail_password = email_passwd
    logger = logging.getLogger("AFP Email module")
    try:
        server_ssl = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server_ssl.login(gmail_user, gmail_password)
        server_ssl.send_message(msg)
        logger.info("Email sent to: " + ", ".join(recipients))
        server_ssl.quit()
    except:
        logger.fatal("Can't connect to smtp server. AFP emails not sent.")
