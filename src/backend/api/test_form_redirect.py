import falcon
import falcon.testing
import pytest

from src.backend.api.endpoints.form_redirect import FormLinkRedirect
from src.backend.common.emailtools import FORM_LINK_VERSION, encode_form_url

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
