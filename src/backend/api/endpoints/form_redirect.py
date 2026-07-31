import logging
import urllib.parse

import falcon

from src.backend.common.emailtools import decode_form_url

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
        """Reject any target that is not on the submission form's own origin.

        Without this the endpoint is an open redirect, and a link on our own
        domain in our own email template is precisely what a phishing attempt
        would want to borrow. Only scheme and host are checked; any path on our
        own origin is allowed.

        urlsplit raises ValueError for hosts that change under NFKC
        normalization, so parse failures have to count as "not ours" rather
        than escaping as a 500.
        """
        try:
            expected = urllib.parse.urlsplit(self.afp_base_url)
            actual = urllib.parse.urlsplit(url)
        except ValueError as exc:
            logger.warning("Unparseable redirect target: %s", exc)
            return False
        return (actual.scheme, actual.netloc) == (expected.scheme, expected.netloc)

    @staticmethod
    def _has_control_characters(url):
        """urlsplit strips CR, LF and TAB before parsing, so a target can pass
        the host check while still carrying them. Emitting that raw into the
        Location header is header injection; gunicorn >= 22 rejects it, but we
        must not depend on the WSGI server for this.
        """
        return any(char < ' ' or char == '\x7f' for char in url)

    def on_get(self, req, resp, version, token):
        try:
            form_url = decode_form_url(token, version=version)
        except ValueError as exc:
            logger.warning("Undecodable form link token: %s", exc)
            raise falcon.HTTPNotFound()
        if self._has_control_characters(form_url):
            logger.warning("Form link target contains control characters, refusing to redirect")
            raise falcon.HTTPNotFound()
        if not self._is_own_url(form_url):
            logger.warning("Form link token pointing outside %s, refusing to redirect",
                           self.afp_base_url)
            raise falcon.HTTPNotFound()
        raise falcon.HTTPFound(form_url)
