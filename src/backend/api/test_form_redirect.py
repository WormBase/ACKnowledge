import falcon
import falcon.testing
import pytest

from src.backend.api.endpoints.form_redirect import FormLinkRedirect
from src.backend.common.emailtools import (
    FORM_LINK_DECODERS,
    FORM_LINK_VERSION,
    encode_form_url,
)

FULL_URL = (
    "https://acknowledge.textpressolab.com?paper=00069459"
    "&passwd=1784767777.9148982"
    "&title=WDR-5%20exhibits%20H3K4%20methylation-independent%20activity"
    "%20during%20embryonic%20development%20in%C2%A0C.%20elegans."
    "&journal=Epigenetics%20%26%20chromatin"
    "&pmid=PMID:41882729"
    "&personid=2615"
    "&hide_genes=false&hide_alleles=false&hide_strains=false"
    "&doi=DOI%3A10.1186/s13072-026-00669-y"
)


@pytest.fixture
def client():
    app = falcon.App()
    app.add_route('/api/f/{version}/{token}',
                  FormLinkRedirect(afp_base_url="https://acknowledge.textpressolab.com"))
    return falcon.testing.TestClient(app)


def _get(client, token, version=FORM_LINK_VERSION):
    return client.simulate_get('/api/f/{}/{}'.format(version, token))


def test_redirects_to_the_original_url(client):
    result = _get(client, encode_form_url(FULL_URL))
    assert result.status_code == 302
    assert result.headers['location'] == FULL_URL


def test_redirect_preserves_hide_flags_set_to_true(client):
    url = FULL_URL.replace("hide_strains=false", "hide_strains=true")
    result = _get(client, encode_form_url(url))
    assert "hide_strains=true" in result.headers['location']


def test_unknown_format_version_is_not_found(client):
    result = _get(client, encode_form_url(FULL_URL), version="99")
    assert result.status_code == 404


def test_corrupted_token_is_not_found(client):
    result = _get(client, encode_form_url(FULL_URL)[:-8])
    assert result.status_code == 404


def test_token_for_a_foreign_host_is_rejected(client):
    result = _get(client, encode_form_url("https://evil.example.com/steal"))
    assert result.status_code == 404


def test_every_registered_version_is_served(client, monkeypatch):
    """Guards against reintroducing an equality check on FORM_LINK_VERSION,
    which would 404 links minted before a version bump."""
    monkeypatch.setitem(FORM_LINK_DECODERS, "2", lambda token: FULL_URL)
    assert _get(client, encode_form_url(FULL_URL), version=FORM_LINK_VERSION).status_code == 302
    assert _get(client, "anything", version="2").status_code == 302


def test_host_that_urlsplit_refuses_to_parse_is_not_found(client):
    """urlsplit raises ValueError for netlocs that change under NFKC
    normalization; unhandled that is a 500 on a public endpoint."""
    result = _get(client, encode_form_url("https://acknowledge.textpressolab.com℀/x"))
    assert result.status_code == 404


def test_carriage_return_in_the_target_is_rejected(client):
    """urlsplit strips CR/LF before parsing, so the host check passes while the
    raw string still carries them into the Location header."""
    result = _get(client, encode_form_url(
        "https://acknowledge.textpressolab.com/x\r\nSet-Cookie: pwned=1"))
    assert result.status_code == 404


def test_tab_in_the_target_is_rejected(client):
    result = _get(client, encode_form_url(
        "https://acknowledge.textpressolab.com/x\ty"))
    assert result.status_code == 404


def test_token_that_decompresses_to_a_huge_url_is_not_found(client):
    huge = "https://acknowledge.textpressolab.com/" + "A" * 3_000_000
    result = _get(client, encode_form_url(huge))
    assert result.status_code == 404


def test_absurdly_long_token_is_rejected_before_decoding(client):
    result = _get(client, "A" * 20000)
    assert result.status_code == 404
