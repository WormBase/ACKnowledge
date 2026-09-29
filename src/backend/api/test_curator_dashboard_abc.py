from unittest import mock

import falcon
import falcon.testing
import pytest
from wbtools.literature.abc_tags import empty_paper_tags

from src.backend.api.endpoints.curator_dashboard import CuratorDashboardReader

DB_FIELDS = {"tfp_genestudied": "00000009;%;zyg-1", "afp_genestudied": '00000009;%;zyg-1 "a\\b"',
             "afp_rnai": "checked", "afp_otherexpr": "", "afp_seqchange": "some details"}


class FakeCursor:
    """records the SQL and returns no rows"""

    def __init__(self):
        self.queries = []

    def execute(self, query, params=None):
        self.queries.append(query)

    def fetchall(self):
        return []

    def fetchone(self):
        return None


@pytest.fixture
def db():
    db = mock.MagicMock()
    db._get_single_field.side_effect = lambda paper_id, table: DB_FIELDS.get(table)
    db.afp.get_cursor.return_value.__enter__.return_value = FakeCursor()
    # Caltech cur_blackbox: rnai and seqchange positive
    db.paper.is_paper_positive_for_class.side_effect = \
        lambda automated_classification_values, cl, min_value: cl in ("rnai", "seqchange")
    return db


@pytest.fixture
def client(db):
    app = falcon.App()
    app.add_route('/api/read_admin/{req_type}', CuratorDashboardReader(db, "https://afp", None, None))
    return falcon.testing.TestClient(app)


def post(client, req_type, tags=None, media=None):
    with mock.patch("src.backend.api.endpoints.curator_dashboard.get_ack_pipeline_tags",
                    return_value=tags) as abc:
        result = client.simulate_post('/api/read_admin/' + req_type, json=media or {"paper_id": "00000001"})
    return result, abc


def ack_classified(levels):
    tags = empty_paper_tags()
    for topic, level in levels.items():
        tags["classifications"]["ACKnowledge_pipeline"][topic] = {
            "negated": level == "NEG", "confidence_level": level, "confidence_score": 0.5, "data_novelty": None,
            "data_context": None, "ml_model_version": None, "date_created": ""}
    return tags


def test_flagged_comes_from_the_ack_pipeline_tags(client, db):
    result, abc = post(client, "flagged", ack_classified({"ATP:0000041": "HIGH", "ATP:0000082": "NEG"}))
    abc.assert_called_once_with("00000001")
    assert result.json["svm_otherexpr_checked"] == "True"
    assert result.json["svm_rnai_checked"] == "False"
    assert result.json["svm_geneint_checked"] == "False"
    assert result.json["afp_rnai_checked"] == "True"
    assert result.json["afp_rnai_details"] == ""
    assert result.json["afp_geneint_checked"] == "null"
    db.paper.is_paper_positive_for_class.assert_not_called()


def test_flagged_falls_back_to_cur_blackbox(client):
    for tags in (empty_paper_tags(), None):
        result, _ = post(client, "flagged", tags)
        assert result.json["svm_rnai_checked"] == "True"
        assert result.json["svm_otherexpr_checked"] == "False"


def test_flagged_seqchange_is_manual_only(client):
    for tags in (ack_classified({"ATP:0000082": "HIGH"}), None):
        result, _ = post(client, "flagged", tags)
        assert result.json["svm_seqchange_checked"] == "False"
        assert result.json["afp_seqchange_details"] == "some details"


def test_lists_come_from_the_ack_pipeline_tags(client):
    tags = empty_paper_tags()
    tags["has_ack_pipeline_entity_tags"] = True
    tags["entities"]["ACKnowledge_pipeline"]["gene"] = [("WB:WBGene00002974", "lev-1")]
    result, _ = post(client, "lists", tags)
    assert result.json["tfp_genestudied"] == "00002974;%;lev-1"
    assert result.json["tfp_alleles"] == ""
    assert result.json["afp_species"] == "null"


def test_lists_fall_back_to_the_database(client):
    for tags in (empty_paper_tags(), None):
        result, _ = post(client, "lists", tags)
        assert result.json["tfp_genestudied"] == "00000009;%;zyg-1"
        assert result.json["tfp_strains"] == "null"


def test_lists_with_quotes_are_valid_json(client):
    result, _ = post(client, "lists", None)
    assert result.json["afp_genestudied"] == '00000009;%;zyg-1 "a\\b"'


def papers_media(list_type):
    return {"from": 0, "count": 10, "list_type": list_type, "svm_filters": "rnai,geneint", "manual_filters": "",
            "curation_filters": "", "combine_filters": "OR"}


def test_processed_list_ignores_the_classification_filters(client, db):
    db.afp.get_paper_ids_afp_no_submission.side_effect = lambda **kwargs: 0 if kwargs.get("count") else []
    result, _ = post(client, "papers", media=papers_media("processed"))
    assert result.json["classification_filters_available"] is False
    for call in db.afp.get_paper_ids_afp_no_submission.call_args_list:
        assert call[1]["must_be_autclass_positive_data_types"] is None


def test_submitted_list_keeps_the_filters_on_author_answers(client, db):
    db.afp.get_paper_ids_afp_full_submission.side_effect = lambda **kwargs: 0 if kwargs.get("count") else []
    result, _ = post(client, "papers", media=papers_media("submitted"))
    assert result.json["classification_filters_available"] is True
    for call in db.afp.get_paper_ids_afp_full_submission.call_args_list:
        assert call[1]["must_be_autclass_positive_data_types"] == ["rnai", "geneint"]


def test_all_papers_ignores_the_classification_filters_except_for_submitted(client, db):
    db.afp.get_paper_ids_afp_partial_submission.return_value = []
    db.afp.get_paper_ids_afp_full_submission.return_value = []
    post(client, "all_papers", media=papers_media("partial"))
    post(client, "all_papers", media=papers_media("submitted"))
    assert db.afp.get_paper_ids_afp_partial_submission.call_args[1]["must_be_autclass_positive_data_types"] is None
    assert db.afp.get_paper_ids_afp_full_submission.call_args[1]["must_be_autclass_positive_data_types"] == \
        ["rnai", "geneint"]


STATS_WARNING = "Classifier statistics are unavailable until the ABC statistics endpoints are available (SCRUM-6600)."


def stats(client, req_type):
    with mock.patch.object(CuratorDashboardReader, "_compute_entity_confirmation_rates", return_value={}), \
            mock.patch.object(CuratorDashboardReader, "_compute_entity_curator_agreement", return_value={}), \
            mock.patch.object(CuratorDashboardReader, "_compute_confirmation_rates_timeseries",
                              return_value=[["2025", {"Genes": 50.0}]]), \
            mock.patch.object(CuratorDashboardReader, "_compute_entity_curator_timeseries", return_value={}):
        return client.simulate_post('/api/read_admin/' + req_type, json={})


def executed_sql(db):
    return " ".join(db.afp.get_cursor.return_value.__enter__.return_value.queries)


def test_predicted_vs_author_stats_are_unavailable(client, db):
    for req_type in ("data_type_flags_confusion_matrix", "data_type_flags_accuracy_timeseries"):
        assert stats(client, req_type).json == {"unavailable": True, "reason": STATS_WARNING}
    assert "cur_blackbox" not in executed_sql(db)


def test_curator_agreement_keeps_author_vs_curator(client, db):
    result = stats(client, "data_type_flags_curator_agreement").json
    assert result["RNAi phenotype"]["accuracy_pc"] is None
    assert result["RNAi phenotype"]["f1_pc"] is None
    assert result["Disease"]["accuracy_ac"] == 0
    assert "cur_blackbox" not in executed_sql(db)


def test_overall_agreement_has_no_predicted_flag_values(client, db):
    result = stats(client, "overall_agreement").json
    assert result["classifier_stats_unavailable"] == STATS_WARNING
    assert result["flags"]["predicted_vs_author_accuracy"] is None
    assert result["flags"]["predicted_vs_curator_f1"] is None
    assert result["flags"]["author_vs_curator_accuracy"] == 0
    assert "cur_blackbox" not in executed_sql(db)


def test_overall_timeseries_has_no_predicted_flag_values(client, db):
    result = stats(client, "overall_timeseries").json
    assert [period for period, _ in result] == ["2025"]
    values = result[0][1]
    assert values["entities_pred_vs_author_jaccard"] == 50.0
    assert values["flags_pred_vs_author_accuracy"] is None
    assert values["flags_pred_vs_curator_f1"] is None
    assert values["flags_author_vs_curator_accuracy"] == 0
    assert "cur_blackbox" not in executed_sql(db)
