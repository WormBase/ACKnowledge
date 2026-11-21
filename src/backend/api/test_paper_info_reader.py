import json
from unittest import mock

import falcon
import falcon.testing
import pytest
from wbtools.literature.abc_tags import empty_paper_tags

from src.backend.api.endpoints.submission_form import PaperInfoReader

CGI_DATA = {"otherexpr": {"afp": None, "blackbox": "HIGH"}, "rnai": {"blackbox": "MEDIUM"},
            "seqchange": {"afp": "", "blackbox": "HIGH"}, "structcorr": {"afp": "checked"},
            "genestudied": {"tfp": "00000009;%;zyg-1", "afp": "00000009;%;zyg-1"},
            "species": {"tfp": "Caenorhabditis elegans"}}


def ack_tags(levels=None, genes=None):
    tags = empty_paper_tags()
    for topic, level in (levels or {}).items():
        tags["classifications"]["ACKnowledge_pipeline"][topic] = {
            "negated": level == "NEG", "confidence_level": level, "confidence_score": 0.5, "data_novelty": None,
            "data_context": None, "ml_model_version": None, "date_created": ""}
    if genes is not None:
        tags["has_ack_pipeline_entity_tags"] = True
        tags["entities"]["ACKnowledge_pipeline"]["gene"] = list(genes)
    return tags


@pytest.fixture
def client():
    app = falcon.App()
    app.add_route('/api/read_paper_info', PaperInfoReader())
    return falcon.testing.TestClient(app)


def read(client, tags, cgi_body=None, afp_values=None):
    cgi_response = mock.Mock()
    cgi_response.read.return_value = (cgi_body if cgi_body is not None else json.dumps(CGI_DATA)).encode("utf-8")
    answers = mock.Mock(side_effect=afp_values) if isinstance(afp_values, Exception) else \
        mock.Mock(return_value=afp_values if afp_values is not None else {})
    with mock.patch("src.backend.api.endpoints.submission_form.urlopen", return_value=cgi_response), \
            mock.patch("src.backend.api.endpoints.submission_form.get_ack_form_afp_values", answers), \
            mock.patch("src.backend.api.endpoints.submission_form.get_ack_pipeline_tags",
                       return_value=tags) as abc:
        result = client.simulate_get('/api/read_paper_info', params={"paper": "00000001", "passwd": "123.4"})
    return result, abc


def test_ack_pipeline_levels_replace_the_caltech_values(client):
    result, abc = read(client, ack_tags(levels={"ATP:0000041": "NEG", "ATP:0000082": "HIGH"}))
    abc.assert_called_once_with("00000001")
    assert result.status_code == 200
    assert result.json["otherexpr"] == {"afp": None, "blackbox": "NEG"}
    assert result.json["rnai"] == {"blackbox": "HIGH"}


def test_mapped_datatype_without_ack_tag_loses_the_caltech_value(client):
    result, _ = read(client, ack_tags(levels={"ATP:0000082": "MEDIUM"}))
    assert "blackbox" not in result.json["otherexpr"]
    assert result.json["rnai"] == {"blackbox": "MEDIUM"}
    assert result.json["structcorr"] == {"afp": "checked"}


def test_seqchange_is_manual_only(client):
    for tags in (ack_tags(levels={"ATP:0000082": "HIGH"}), ack_tags(), None):
        result, _ = read(client, tags)
        assert result.json["seqchange"] == {"afp": ""}


def test_tfp_values_come_from_the_ack_pipeline_tags(client):
    result, _ = read(client, ack_tags(genes=[("WB:WBGene00002974", "lev-1"), ("WB:WBGene00000001", "aap-1")]))
    assert result.json["genestudied"] == {"tfp": "00000001;%;aap-1 | 00002974;%;lev-1", "afp": "00000009;%;zyg-1"}
    assert result.json["species"] == {"tfp": ""}


def test_entities_and_classifications_fall_back_separately(client):
    # imported before April 2026: entity tags only; the pre-checks stay Caltech's
    result, _ = read(client, ack_tags(genes=[("WB:WBGene00002974", "lev-1")]))
    assert result.json["genestudied"]["tfp"] == "00002974;%;lev-1"
    assert result.json["otherexpr"] == {"afp": None, "blackbox": "HIGH"}
    # classification tags only: the entities stay Caltech's
    result, _ = read(client, ack_tags(levels={"ATP:0000082": "HIGH"}))
    assert result.json["genestudied"]["tfp"] == "00000009;%;zyg-1"
    assert "blackbox" not in result.json["otherexpr"]


def test_missing_cgi_keys_are_created(client):
    result, _ = read(client, ack_tags(levels={"ATP:0000068": "HIGH"}, genes=[]), cgi_body=json.dumps({"rnai": None}))
    assert result.json["geneint"] == {"blackbox": "HIGH"}
    assert result.json["rnai"] == {}
    for table in ("genestudied", "variation", "strain", "transgene", "species"):
        assert result.json[table] == {"tfp": ""}


def test_abc_failure_keeps_the_cgi_values(client):
    result, _ = read(client, None)
    assert result.json["otherexpr"] == {"afp": None, "blackbox": "HIGH"}
    assert result.json["genestudied"]["tfp"] == "00000009;%;zyg-1"


def test_non_json_cgi_body_is_returned_unchanged(client):
    result, abc = read(client, ack_tags(), cgi_body="<html>error</html>")
    assert result.text == "<html>error</html>"
    abc.assert_not_called()


def test_cgi_failure_is_a_server_error(client):
    with mock.patch("src.backend.api.endpoints.submission_form.urlopen", side_effect=OSError("500")), \
            mock.patch("src.backend.api.endpoints.submission_form.get_ack_pipeline_tags") as abc:
        result = client.simulate_get('/api/read_paper_info', params={"paper": "00000001", "passwd": "1"})
    assert result.status_code == 500
    abc.assert_not_called()


def test_non_numeric_paper_id_is_a_bad_request(client):
    with mock.patch("src.backend.api.endpoints.submission_form.urlopen") as cgi, \
            mock.patch("src.backend.api.endpoints.submission_form.get_ack_pipeline_tags") as abc:
        result = client.simulate_get('/api/read_paper_info', params={"paper": "1/../x", "passwd": "123.4"})
    assert result.status_code == 400
    cgi.assert_not_called()
    abc.assert_not_called()


# SCRUM-4141: the saved author answers come from the paper's ACKnowledge_form tags

def test_afp_values_come_from_abc(client):
    result, _ = read(client, ack_tags(), afp_values={"afp_structcorr": "", "afp_genestudied": "00000830;%;ctl-1"})
    assert result.json["structcorr"] == {"afp": ""}
    assert result.json["genestudied"]["afp"] == "00000830;%;ctl-1"
    assert result.json["genestudied"]["tfp"] == "00000009;%;zyg-1"


def test_unmapped_fields_kept_from_cgi(client):
    cgi = dict(CGI_DATA, comment={"afp": "great form"}, humdis={"afp": '{"checked": true}'})
    result, _ = read(client, ack_tags(), cgi_body=json.dumps(cgi), afp_values={"afp_structcorr": None})
    assert result.json["comment"] == {"afp": "great form"}
    assert result.json["humdis"] == {"afp": '{"checked": true}'}


def test_no_form_tags_means_unanswered(client):
    # every mapped table without a tag is null, whatever Caltech holds
    result, _ = read(client, ack_tags(), afp_values={"afp_structcorr": None, "afp_genestudied": None,
                                                     "afp_otherspecies": None})
    assert result.json["structcorr"] == {"afp": None}
    assert result.json["genestudied"]["afp"] is None
    assert result.json["otherspecies"] == {"afp": None}


def test_abc_unreachable_is_an_error(client):
    from src.backend.common.abc_paper_data import AbcUnavailableError
    result, _ = read(client, ack_tags(), afp_values=AbcUnavailableError("ABC down"))
    assert result.status_code == 500


def test_get_ack_form_afp_values_raises_when_the_abc_fails():
    from wbtools.literature.paper import ABCRequestError
    from src.backend.common import abc_paper_data
    with mock.patch.object(abc_paper_data, "get_abc_curie", return_value="AGRKB:1"), \
            mock.patch.object(abc_paper_data, "get_ack_form_tags", side_effect=ABCRequestError("boom")):
        with pytest.raises(abc_paper_data.AbcUnavailableError):
            abc_paper_data.get_ack_form_afp_values("00000001")
    with mock.patch.object(abc_paper_data, "get_abc_curie", return_value=None):
        with pytest.raises(abc_paper_data.AbcUnavailableError):
            abc_paper_data.get_ack_form_afp_values("00000001")


def test_get_ack_form_afp_values_rebuilds_from_tags():
    from src.backend.common import abc_paper_data
    tags = [{"topic": "ATP:0000082", "negated": False, "data_novelty": "ATP:0000335", "note": "in L4",
             "created_by": "WBPerson1"}]
    with mock.patch.object(abc_paper_data, "get_abc_curie", return_value="AGRKB:1"), \
            mock.patch.object(abc_paper_data, "get_ack_form_tags", return_value=tags):
        values = abc_paper_data.get_ack_form_afp_values("00000001")
    assert values["afp_rnai"] == "in L4" and values["afp_genestudied"] is None
