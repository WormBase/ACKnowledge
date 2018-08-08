import logging
import smtplib

from email.message import EmailMessage
from typing import List


def send_email(paper_id, paper_title: str, paper_journal: str, afp_link, recipients: List[str]):
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
    msg['From'] = "Valerio Arnaboldi<valerio.arnaboldi@gmail.com>"
    #msg['To'] = ", ".join(recipients)
    msg['To'] = "valerio.arnaboldi@gmail.com"

    gmail_user = "valerio.arnaboldi@gmail.com"
    gmail_password = ".Man1984gusta#"
    logger = logging.getLogger("AFP Email module")
    try:
        server_ssl = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server_ssl.login(gmail_user, gmail_password)
        server_ssl.send_message(msg)
        logger.info("Email sent to: " + ", ".join(recipients))
        server_ssl.quit()
    except:
        logger.fatal("Can't connect to smtp server. AFP emails not sent.")
