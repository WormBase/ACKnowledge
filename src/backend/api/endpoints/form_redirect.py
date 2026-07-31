import logging
import urllib.parse

import falcon

from src.backend.common.emailtools import FORM_LINK_VERSION, decode_form_url

logger = logging.getLogger(__name__)


class FormLinkRedirect(object):
    """Expands the encoded links sent to authors back into full form URLs.

    Emails carry '/api/f/<version>/<token>' instead of the query string itself,
    because some mail gateways corrupt '=' followed by two hex digits in the
    message body (issue #424). The token is an encoding, not a secret: the
    paper password in the expanded URL remains the credential, exactly as
    before.
    """

    def __init__(self, afp_base_url):
        self.afp_base_url = afp_base_url

    def _is_own_url(self, url):
        """Reject tokens pointing anywhere but the submission form.

        Without this the endpoint is an open redirect, and a link on our own
        domain in our own email template is precisely what a phishing attempt
        would want to borrow.
        """
        expected = urllib.parse.urlsplit(self.afp_base_url)
        actual = urllib.parse.urlsplit(url)
        return (actual.scheme, actual.netloc) == (expected.scheme, expected.netloc)

    def on_get(self, req, resp, version, token):
        if version != FORM_LINK_VERSION:
            logger.warning("Form link with unsupported version %s", version)
            raise falcon.HTTPNotFound()
        try:
            form_url = decode_form_url(token)
        except ValueError as exc:
            logger.warning("Undecodable form link token: %s", exc)
            raise falcon.HTTPNotFound()
        if not self._is_own_url(form_url):
            logger.warning("Form link token pointing outside %s, refusing to redirect",
                           self.afp_base_url)
            raise falcon.HTTPNotFound()
        raise falcon.HTTPFound(form_url)
