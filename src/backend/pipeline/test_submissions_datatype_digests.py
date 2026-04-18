import json

from src.backend.pipeline.submissions_datatype_digests import (
    filter_and_format_disease_submissions,
)


def _json(checked, comment="", diseases=None):
    return json.dumps({
        "checked": checked,
        "comment": comment,
        "diseases": diseases or [],
    })


def test_drops_paper_when_checked_false():
    papers = {"WBPaper001": _json(False)}
    assert filter_and_format_disease_submissions(papers) == {}


def test_keeps_paper_with_comment_and_diseases():
    papers = {
        "WBPaper002": _json(
            True,
            comment="loss of function phenotype",
            diseases=[{"id": "DOID:14330", "name": "Parkinson disease"},
                      {"id": "DOID:10652", "name": "Alzheimer disease"}],
        )
    }
    result = filter_and_format_disease_submissions(papers)
    assert result == {
        "WBPaper002": "loss of function phenotype; diseases: "
                      "Parkinson disease, Alzheimer disease"
    }


def test_keeps_paper_with_comment_only():
    papers = {"WBPaper003": _json(True, comment="relevant to ALS")}
    assert filter_and_format_disease_submissions(papers) == {
        "WBPaper003": "relevant to ALS"
    }


def test_keeps_paper_with_diseases_only():
    papers = {
        "WBPaper004": _json(
            True, diseases=[{"id": "DOID:1", "name": "cancer"}]
        )
    }
    assert filter_and_format_disease_submissions(papers) == {
        "WBPaper004": "diseases: cancer"
    }


def test_keeps_paper_checked_with_empty_comment_and_diseases():
    papers = {"WBPaper005": _json(True)}
    assert filter_and_format_disease_submissions(papers) == {
        "WBPaper005": "Checked"
    }


def test_keeps_legacy_non_json_value():
    papers = {"WBPaper006": "Checked"}
    assert filter_and_format_disease_submissions(papers) == {
        "WBPaper006": "Checked"
    }


def test_keeps_legacy_free_text_value():
    papers = {"WBPaper007": "some legacy comment text"}
    assert filter_and_format_disease_submissions(papers) == {
        "WBPaper007": "some legacy comment text"
    }


def test_keeps_value_that_is_valid_json_but_not_dict():
    papers = {"WBPaper008": '[{"id": 1, "name": "foo"}]'}
    assert filter_and_format_disease_submissions(papers) == {
        "WBPaper008": '[{"id": 1, "name": "foo"}]'
    }


def test_ignores_disease_entries_with_missing_name():
    papers = {
        "WBPaper009": _json(
            True,
            diseases=[{"id": "DOID:1", "name": ""},
                      {"id": "DOID:2"},
                      {"id": "DOID:3", "name": "valid"}],
        )
    }
    assert filter_and_format_disease_submissions(papers) == {
        "WBPaper009": "diseases: valid"
    }


def test_mixed_batch_drops_negatives_and_keeps_positives():
    papers = {
        "WBPaper010": _json(False),
        "WBPaper011": _json(True, comment="note"),
        "WBPaper012": "legacy",
    }
    assert filter_and_format_disease_submissions(papers) == {
        "WBPaper011": "note",
        "WBPaper012": "legacy",
    }
