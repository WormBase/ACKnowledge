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
    def _is_unsafe_in_a_header(url):
        """Whether this target cannot be safely emitted as a Location header.

        Two distinct hazards, both invisible to the host check:

        urlsplit strips CR, LF and TAB before parsing, so a target carrying
        them still looks like ours. Emitting that raw is header injection;
        gunicorn >= 22 rejects it, but we must not rely on the WSGI server.

        WSGI encodes header values as latin-1, so a target on our own origin
        with a non-Latin-1 character makes the worker raise after
        start_response - an unauthenticated 500. Falcon's test client does not
        model that encoding step, so only a positive test catches it.

        A legitimate form URL is percent-encoded and therefore printable ASCII,
        so requiring that subsumes both cases.
        """
        return not all(' ' <= char <= '~' for char in url)

    def on_get(self, req, resp, version, token):
        try:
            form_url = decode_form_url(token, version=version)
        except ValueError as exc:
            logger.warning("Undecodable form link token: %s", exc)
            raise falcon.HTTPNotFound()
        if self._is_unsafe_in_a_header(form_url):
            logger.warning("Form link target is not printable ASCII, refusing to redirect")
            raise falcon.HTTPNotFound()
        if not self._is_own_url(form_url):
            logger.warning("Form link token pointing outside %s, refusing to redirect",
                           self.afp_base_url)
            raise falcon.HTTPNotFound()
        raise falcon.HTTPFound(form_url)

    # Mail security scanners probe links before the recipient clicks, and a 405
    # can get the link flagged as broken. The endpoint is stateless, so serving
    # a probe costs nothing and consumes nothing.
    on_head = on_get
