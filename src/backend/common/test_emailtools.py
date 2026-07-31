import quopri

import pytest

from src.backend.common.emailtools import (
    FORM_LINK_VERSION,
    decode_form_url,
    encode_form_url,
    to_redirect_url,
)


# A real link from the pipeline log for WBPaper00069459. The title carries a
# non-breaking space (%C2%A0) and the journal an escaped ampersand (%26), which
# are exactly the parts earlier attempts at this URL mangled.
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


def test_encoded_token_round_trips_to_the_identical_url():
    assert decode_form_url(encode_form_url(FULL_URL)) == FULL_URL


def test_encoded_token_preserves_hide_flags_when_set_to_true():
    url = FULL_URL.replace("hide_genes=false", "hide_genes=true")
    assert "hide_genes=true" in decode_form_url(encode_form_url(url))


def test_encoded_token_omits_characters_that_mail_filters_corrupt():
    token = encode_form_url(FULL_URL)
    assert not set(token) & set("=&%")


def test_encoded_token_is_a_single_url_path_segment():
    token = encode_form_url(FULL_URL)
    assert not set(token) - set(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")


def test_redirect_url_carries_the_version_and_no_query_string():
    redirect_url = to_redirect_url("https://acknowledge.textpressolab.com", FULL_URL)
    prefix = f"https://acknowledge.textpressolab.com/api/f/{FORM_LINK_VERSION}/"
    assert redirect_url.startswith(prefix)
    assert "?" not in redirect_url


def test_redirect_url_tolerates_a_trailing_slash_on_the_base_url():
    assert to_redirect_url("https://acknowledge.textpressolab.com/", FULL_URL) == \
           to_redirect_url("https://acknowledge.textpressolab.com", FULL_URL)


def test_decoding_a_corrupted_token_raises_value_error():
    token = encode_form_url(FULL_URL)
    with pytest.raises(ValueError):
        decode_form_url(token[:-8])


def _mangle_like_a_mail_gateway(text):
    """Decode as quoted-printable without the '=' having been escaped first.

    This is what corrupted the links WBPaper00069459 and WBPaper00069488 in
    July 2026: '=' followed by two hex digits became a single byte, so
    'paper=00069459' arrived as 'paper\\x00069459'.
    """
    return quopri.decodestring(text.encode("utf-8")).decode("utf-8", "replace")


def test_the_gateway_mangling_reproduces_the_reported_corruption():
    mangled = _mangle_like_a_mail_gateway(FULL_URL)
    assert "paper=00069459" not in mangled
    assert "passwd=1784767777.9148982" not in mangled
    assert "personid&15" in mangled          # '=26' decoded to '&'


def test_encoded_link_survives_the_gateway_mangling():
    link = to_redirect_url("https://acknowledge.textpressolab.com", FULL_URL)
    assert _mangle_like_a_mail_gateway(link) == link
