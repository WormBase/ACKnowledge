import quopri
import random

import pytest

from src.backend.common.emailtools import (
    FORM_LINK_VERSION,
    MAX_FORM_URL_BYTES,
    build_html_message,
    decode_form_url,
    encode_form_url,
    encode_form_url_v1,
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


TOKEN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"


def test_no_single_character_corruption_decodes_to_a_different_url():
    """A format meant to survive corruption has to be able to detect it.

    Raw deflate carries no checksum, so two thirds of single-character
    corruptions used to decode into a plausible but wrong URL instead of
    failing.
    """
    token = encode_form_url(FULL_URL)
    rng = random.Random(11)
    for _ in range(3000):
        pos = rng.randrange(len(token))
        replacement = rng.choice([c for c in TOKEN_ALPHABET if c != token[pos]])
        corrupted = token[:pos] + replacement + token[pos + 1:]
        try:
            decoded = decode_form_url(corrupted)
        except ValueError:
            continue
        assert decoded == FULL_URL, "corruption decoded silently to {!r}".format(decoded)


def test_links_minted_at_an_older_version_still_decode():
    """Reminder emails reference links for weeks; a version bump must not
    invalidate what is already sitting in authors' inboxes."""
    assert FORM_LINK_VERSION != "1", "this test is meaningless while we still emit v1"
    assert decode_form_url(encode_form_url_v1(FULL_URL), version="1") == FULL_URL


def test_unknown_version_is_rejected():
    with pytest.raises(ValueError):
        decode_form_url(encode_form_url(FULL_URL), version="99")


def test_token_expanding_beyond_the_limit_is_rejected():
    """The endpoint decompresses attacker-supplied data; without a cap a short
    token expands to megabytes."""
    oversized = "https://acknowledge.textpressolab.com/" + "A" * (MAX_FORM_URL_BYTES + 1)
    with pytest.raises(ValueError):
        decode_form_url(encode_form_url(oversized))


def test_email_body_is_encoded_within_the_rfc_line_length_limit():
    """RFC 5322 caps a line at 998 octets. Our templates render to a single
    ~2700 character line, and an over-long line is what invites a gateway to
    re-encode the body in the first place."""
    content = "<a href=\"https://x.test/a?b=00\">" + "x " * 2000 + "</a>"
    msg = build_html_message("subject", content, "from@x.test", "reply@x.test",
                             ["to@x.test"])
    payload = msg.get_payload()[0]
    assert payload["Content-Transfer-Encoding"] == "base64"
    assert max(len(line) for line in msg.as_string().split("\n")) <= 998


def test_email_body_round_trips_through_the_mime_encoding():
    content = "<p>café — in C. elegans</p>"
    msg = build_html_message("subject", content, "from@x.test", "reply@x.test",
                             ["to@x.test"])
    payload = msg.get_payload()[0]
    assert payload.get_payload(decode=True).decode("utf-8") == content
