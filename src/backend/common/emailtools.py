import base64
import logging
import smtplib
import urllib.parse
import zlib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List
from urllib.request import urlopen


logger = logging.getLogger(__name__)

# Version of the encoded form-link format we currently emit, carried in the
# redirect path. Decoding dispatches through FORM_LINK_DECODERS rather than
# comparing against this constant, so when the format next changes you add a
# decoder and bump this, and links already sitting in authors' inboxes keep
# resolving - reminder emails reference them for weeks.
FORM_LINK_VERSION = "1"

# Real form URLs are a few hundred bytes. The endpoint decompresses untrusted
# input, so cap both ends: without a limit a 4 KB token expands to ~3 MB.
MAX_FORM_URL_BYTES = 4096
MAX_FORM_TOKEN_CHARS = 3000


def _b64url_decode(token: str) -> bytes:
    return base64.urlsafe_b64decode(token + "=" * (-len(token) % 4))


def _inflate(packed: bytes, wbits: int) -> str:
    decompressor = zlib.decompressobj(wbits)
    data = decompressor.decompress(packed, MAX_FORM_URL_BYTES)
    if decompressor.unconsumed_tail:
        raise ValueError("form URL token expands beyond {} bytes".format(MAX_FORM_URL_BYTES))
    # decompressobj, unlike zlib.decompress, does not finalise the stream, so
    # nothing has verified the trailing Adler-32 yet. eof is only set on
    # Z_STREAM_END, which zlib reaches solely after the checksum matches.
    if not decompressor.eof:
        raise ValueError("form URL token is truncated")
    if decompressor.unused_data:
        raise ValueError("form URL token has trailing data")
    return data.decode("utf-8")


def encode_form_url(url: str) -> str:
    """Pack a submission form URL into a single URL-safe path segment.

    Some mail gateways re-encode message bodies as quoted-printable without
    escaping the literal '=' characters already present. A recipient's client
    then decodes every '=' followed by two hex digits, which silently destroys
    'paper=00069459', 'passwd=1784767777...' and 'hide_genes=false' while
    leaving 'title=WDR-5...' intact. base64url without padding restricts the
    token to [A-Za-z0-9-_], so there is nothing left for such a decoder - or
    for an HTML entity parser - to corrupt. See issue #424.

    The zlib container (rather than raw deflate) costs 8 characters and adds an
    Adler-32 checksum, so a token damaged in transit fails loudly instead of
    decoding into a plausible but wrong URL.
    """
    return base64.urlsafe_b64encode(
        zlib.compress(url.encode("utf-8"), 9)).decode("ascii").rstrip("=")


FORM_LINK_DECODERS = {
    "1": lambda token: _inflate(_b64url_decode(token), zlib.MAX_WBITS),
}


def decode_form_url(token: str, version: str = FORM_LINK_VERSION) -> str:
    """Recover the URL packed by encode_form_url.

    Raises ValueError if the version is unknown or the token is malformed,
    truncated, corrupted or oversized.
    """
    decoder = FORM_LINK_DECODERS.get(version)
    if decoder is None:
        raise ValueError("unsupported form link version: {!r}".format(version))
    if len(token) > MAX_FORM_TOKEN_CHARS:
        raise ValueError("form URL token longer than {} characters".format(MAX_FORM_TOKEN_CHARS))
    try:
        return decoder(token)
    except (ValueError, zlib.error) as exc:
        raise ValueError("malformed form URL token: {}".format(exc)) from exc


def to_redirect_url(afp_base_url: str, form_url: str) -> str:
    """Build the opaque, filter-proof link that goes into emails to authors."""
    return "{}/api/f/{}/{}".format(afp_base_url.rstrip("/"), FORM_LINK_VERSION,
                                   encode_form_url(form_url))


def build_html_message(subject, content, from_addr, reply_to_addr, recipients):
    """Assemble the outgoing HTML message.

    The charset is pinned to utf-8 so the body is base64 encoded and wrapped at
    76 columns. Left to itself, MIMEText picks us-ascii for an ASCII body and
    emits it as 7bit, which for our templates means a single ~2700 character
    line - well past the 998 octet limit in RFC 5322 section 2.1.1. An
    over-long line is what prompts a gateway to re-encode the body, and a
    gateway that re-encodes to quoted-printable without escaping '=' is what
    corrupted these links in the first place (issue #424).
    """
    msg = MIMEMultipart("alternative")
    msg.attach(MIMEText(content, "html", "utf-8"))
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["reply-to"] = reply_to_addr
    msg["To"] = ", ".join(recipients)
    return msg


class EmailManager(object):

    def __init__(self, config, email_passwd, email_user):
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
        self.content_email_coauthor_notification = config["emails"]["content_coauthor_notification"]
        self.subject_email_coauthor_notification = config["emails"]["subject_coauthor_notification"]
        self.content_email_user_error = config["emails"]["content_user_error"]
        self.subject_email_user_error = config["emails"]["subject_user_error"]
        self.email_user = email_user
        self.server_host = config["emails"]["server_host"]
        self.server_port = config["emails"]["server_port"]
        self.email_passwd = email_passwd
        self._smtp = None
        self._persistent = False

    def __enter__(self):
        # Hold one authenticated SMTP connection open for the duration of the
        # `with` block so a batch of sends costs one AUTH instead of one per
        # message. Gmail rate-limits AUTH attempts independently of message
        # volume, so reusing the connection is what prevents 454 lockouts.
        self._persistent = True
        self._connect()
        return self

    def __exit__(self, exc_type, exc, tb):
        self._persistent = False
        self._close()

    def _connect(self):
        smtp = smtplib.SMTP_SSL(self.server_host, self.server_port, timeout=30)
        smtp.login(self.email_user, self.email_passwd)
        self._smtp = smtp

    def _close(self):
        if self._smtp is not None:
            try:
                self._smtp.quit()
            except Exception:
                pass
            self._smtp = None

    def send_email(self, subject, content, recipients):
        recipients = [r for r in recipients if r]
        if not recipients:
            logger.warning("No valid recipients for email with subject: %s", subject)
            return
        msg = build_html_message(subject, content, self.from_addr, self.reply_to_addr,
                                 recipients)

        try:
            if self._persistent:
                # Gmail drops idle sockets after a few minutes; if that happened
                # since the last send, reconnect once and retry transparently.
                try:
                    if self._smtp is None:
                        self._connect()
                    self._smtp.send_message(msg)
                except (smtplib.SMTPServerDisconnected, smtplib.SMTPConnectError,
                        ConnectionResetError, BrokenPipeError, OSError):
                    self._close()
                    self._connect()
                    self._smtp.send_message(msg)
            else:
                smtp = smtplib.SMTP_SSL(self.server_host, self.server_port, timeout=30)
                try:
                    smtp.login(self.email_user, self.email_passwd)
                    smtp.send_message(msg)
                finally:
                    try:
                        smtp.quit()
                    except Exception:
                        pass
            logger.info("Email sent to: " + ", ".join(recipients))
        except Exception as e:
            logger.fatal(
                "Can't send email via smtp server. ACKnowledge emails not sent. "
                "Exception type: %s, message: %r", type(e).__name__, e)

    def send_email_to_author(self, paper_id, paper_title: str, paper_journal: str, afp_link, recipients: List[str],
                             coauthor_emails: List[str] = None):
        coauthor_list = ", ".join(coauthor_emails) if coauthor_emails else "none available"
        content = self.content_email_to_author.format(paper_title, paper_journal, paper_id, afp_link, coauthor_list)
        subject = self.subject_email_to_author
        self.send_email(subject=subject, content=content, recipients=recipients)

    def notify_admin_of_paper_without_entities(self, paper_id, paper_title: str, paper_journal: str, afp_link,
                                               recipients: List[str]):
        content = self.content_email_empty.format(paper_title, paper_journal, paper_id, afp_link)
        subject = self.subject_email_empty.format(paper_id)
        self.send_email(subject=subject, content=content, recipients=recipients)

    def send_summary_email_to_admin(self, urls, paper_ids, recipients: List[str]):
        if paper_ids:
            paperid_list = "<br/>".join(['<a href="' + url + '">' + paper_id + "</a>" for paper_id, url in
                                         zip(paper_ids, urls)])
        else:
            paperid_list = "No papers processed this time"
        content = self.content_email_summary.format(paperid_list)
        self.send_email(subject=self.subject_email_summary, content=content, recipients=recipients)

    def send_new_submission_notification_email_to_admin(self, paper_id, paper_title, paper_journal, paper_email,
                                                        recipients: List[str], dashboard_url, form_url,
                                                        test: bool = False):
        logger.info("Sending email to admins: " + ", ".join(recipients))
        content = self.content_email_new_sub.format(paper_id, paper_title, paper_journal, paper_email,
                                                    dashboard_url, form_url)
        subject = self.subject_email_new_sub
        if test:
            subject = "[Dev Test] " + subject
        self.send_email(subject=subject, content=content, recipients=recipients)

    def send_new_data_notification_email_to_watcher(self, data_type_table, paper_ids_val, recipients):
        content = self.content_email_digest.format(data_type_table, "<br/>".join(
            ["<a href='https://dashboard.acknowledge.textpressolab.com/paper?paper_id=" + paper_id + "'>" + paper_id + "</a>:  " +
             paper_ids_val[paper_id] for paper_id in paper_ids_val.keys()]))
        subject = self.subject_email_digest.format(data_type_table)
        self.send_email(subject=subject, content=content, recipients=recipients)

    def send_link_to_author_dashboard(self, token, recipients):
        content = self.content_email_author_dash.format(token, token)
        self.send_email(subject=self.subject_email_author_dash, content=content, recipients=recipients)

    def send_reminder_to_author(self, paper_id, paper_title: str, paper_journal: str, afp_link, recipients: List[str],
                                final_call: bool = False, coauthor_emails: List[str] = None):
        final_text = "Note that after one week's time, partial submissions will be checked and entered into WormBase " \
                     "by one of our curators." if final_call else ""
        coauthor_list = ", ".join(coauthor_emails) if coauthor_emails else "none available"

        content = self.content_email_reminder.format(paper_title, paper_journal, paper_id, afp_link, coauthor_list, final_text)
        subject = self.subject_email_reminder
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
    
    def send_coauthor_notification_email(self, paper_id, paper_title, submitter_name, recipients: List[str],
                                         test: bool = False):
        content = self.content_email_coauthor_notification.format(submitter_name, paper_title, paper_id)
        subject = self.subject_email_coauthor_notification
        if test:
            subject = "[Dev Test] " + subject
        self.send_email(subject=subject, content=content, recipients=recipients)

    def send_user_error_notification(self, error_type, paper_id, person_id, details, recipients: List[str],
                                     test: bool = False):
        content = self.content_email_user_error.format(error_type, paper_id or "N/A",
                                                       person_id or "N/A", details)
        subject = self.subject_email_user_error
        if test:
            subject = "[Dev Test] " + subject
        self.send_email(subject=subject, content=content, recipients=recipients)


