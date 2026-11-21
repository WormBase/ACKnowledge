"""SCRUM-4141: a save writes Caltech and the ABC together or neither."""
import logging
from contextlib import contextmanager
from unittest import mock

import falcon
import falcon.testing
import pytest
from wbtools.literature.ack_form.changes import UNKNOWN_AUTHOR, TagBatch
from wbtools.literature.paper import ABCRequestError

from src.backend.api.endpoints import ack_form_abc, submission_form
from src.backend.api.endpoints.ack_form_abc import (FORM_FIELD_TABLES, NON_ANSWER_FIELDS, resolve_saver,
                                                    sync_paper_to_abc)
from src.backend.api.endpoints.submission_form import FeedbackFormWriter

PAPER = "00000001"
CURIE = "AGRKB:101000000000001"


class FakeDB:
    """a WBDBManager whose transaction() records commit/rollback in self.events"""

    def __init__(self):
        self.events = []
        self.afp, self.person, self.paper = mock.MagicMock(), mock.MagicMock(), mock.MagicMock()
        self.afp.get_paper_id_from_passwd.return_value = PAPER
        self.afp.get_contact_emails.return_value = "author@example.org | coauthor@example.org"
        self.person.get_email.return_value = "author@example.org"
        self.person.get_fullname_from_personid.return_value = "Jane Doe"
        self.paper.get_paper_title.return_value = "A paper"
        self.paper.get_paper_journal.return_value = "Genetics"
        self.paper.get_doi.return_value = "10.1/x"
        self.paper.get_pmid.return_value = "123"

    @contextmanager
    def transaction(self):
        self.events.append("begin")
        try:
            yield self
            self.events.append("commit")
        except BaseException:
            self.events.append("rollback")
            raise


def _writer_client(db, email_manager):
    with mock.patch.object(submission_form, "EmailManager", return_value=email_manager):
        writer = FeedbackFormWriter(db_manager=db, admin_emails=["admin@example.org"], email_passwd="",
                                    email_user="", afp_base_url="https://ack.example.org", test=False)
    app = falcon.App()
    app.add_route('/api/write', writer)
    return falcon.testing.TestClient(app)


def post(db, body, sync=None, email_manager=None):
    email_manager = email_manager or mock.MagicMock()
    client = _writer_client(db, email_manager)
    sync = sync if sync is not None else mock.Mock(return_value=True)
    with mock.patch.object(submission_form, "sync_paper_to_abc", sync):
        result = client.simulate_post('/api/write', json=dict(body, passwd="123.4"))
    return result, sync, email_manager


def test_partial_save_sends_one_batch_and_commits():
    db = FakeDB()
    result, sync, _ = post(db, {"rnai_pheno": "checked", "person_id": "two100"})
    assert result.status_code == 200
    sync.assert_called_once()
    assert sync.call_args.args[1:] == (PAPER, {"rnai_pheno": "checked", "person_id": "two100", "passwd": "123.4"})
    assert db.events == ["begin", "commit"]
    db.afp.set_submitted_rnai_pheno.assert_called_once()


def test_abc_error_rolls_back_and_returns_500():
    db = FakeDB()
    result, _, _ = post(db, {"rnai_pheno": "checked", "person_id": "two100"},
                        sync=mock.Mock(side_effect=ABCRequestError("ABC down")))
    assert result.status_code == 500
    assert db.events == ["begin", "rollback"]


def test_final_submit_abc_error_sends_no_email_and_rolls_back():
    db = FakeDB()
    result, _, email_manager = post(db, {"comments": "thanks", "person_id": "two100"},
                                    sync=mock.Mock(side_effect=ABCRequestError("refused")))
    assert result.status_code == 500
    assert db.events == ["begin", "rollback"]
    db.afp.set_contributor.assert_called_once()  # written, then rolled back with the transaction
    assert email_manager.method_calls == []


def test_final_submit_emails_after_commit():
    db = FakeDB()
    email_manager = mock.MagicMock()
    email_manager.send_new_submission_notification_email_to_admin.side_effect = \
        lambda *a, **k: db.events.append("email")
    result, _, _ = post(db, {"comments": "thanks", "person_id": "two100"}, email_manager=email_manager)
    assert result.status_code == 200
    assert db.events == ["begin", "commit", "email"]
    email_manager.send_new_sub_thanks_email.assert_called_once()
    email_manager.send_coauthor_notification_email.assert_called_once()
    assert email_manager.send_coauthor_notification_email.call_args.kwargs["recipients"] == ["coauthor@example.org"]


def test_final_submit_without_person_is_400_and_writes_nothing():
    db = FakeDB()
    result, sync, _ = post(db, {"comments": "thanks"})
    assert result.status_code == 400
    assert db.events == []
    sync.assert_not_called()


def test_commit_failure_after_batch_is_logged(caplog):
    db = FakeDB()

    @contextmanager
    def failing_commit():
        yield db
        raise RuntimeError("connection lost at commit")

    db.transaction = failing_commit
    with caplog.at_level(logging.ERROR):
        result, _, _ = post(db, {"rnai_pheno": "checked", "person_id": "two100"})
    assert result.status_code == 500
    assert "ABC ahead of Caltech for paper 00000001" in caplog.text


# sync_paper_to_abc

@pytest.fixture
def abc_calls():
    with mock.patch.object(ack_form_abc, "get_abc_curie", return_value=CURIE) as curie, \
            mock.patch.object(ack_form_abc, "load_paper_data") as load, \
            mock.patch.object(ack_form_abc, "answer_set", return_value=([{"topic": "ATP:0000082"}], [])) as answers, \
            mock.patch.object(ack_form_abc, "get_ack_form_tags", return_value=[]) as tags, \
            mock.patch.object(ack_form_abc, "get_ack_form_source_id", return_value=321), \
            mock.patch.object(ack_form_abc, "plan_changes", return_value=TagBatch(delete=[5])) as plan, \
            mock.patch.object(ack_form_abc, "send_tag_batch", return_value=[]) as send:
        load.return_value.contributors = {}
        yield {"curie": curie, "answers": answers, "tags": tags, "plan": plan, "send": send}


def test_sync_sends_the_batch(abc_calls):
    db = FakeDB()
    assert sync_paper_to_abc(db, PAPER, {"rnai_pheno": "checked", "person_id": "two100"}) is True
    abc_calls["send"].assert_called_once()
    args = abc_calls["plan"].call_args.args
    assert args[2] == ["WBPerson100"] and args[4] == "WBPerson100" and args[5] == 321
    assert args[3] == {("ATP:0000082", "ATP:0000335")}


def test_no_changes_sends_no_batch(abc_calls):
    abc_calls["plan"].return_value = TagBatch()
    assert sync_paper_to_abc(FakeDB(), PAPER, {"rnai_pheno": "checked", "person_id": "two100"}) is False
    abc_calls["send"].assert_not_called()


def test_save_without_mapped_section_calls_no_abc(abc_calls):
    assert sync_paper_to_abc(FakeDB(), PAPER, {"comments": "thanks", "person_id": "two100"}) is False
    abc_calls["curie"].assert_not_called()


def test_paper_not_in_abc_is_an_error(abc_calls):
    abc_calls["curie"].return_value = None
    with pytest.raises(ABCRequestError):
        sync_paper_to_abc(FakeDB(), PAPER, {"rnai_pheno": "checked"})


def test_twoundefined_saves_as_unknown_author(abc_calls):
    sync_paper_to_abc(FakeDB(), PAPER, {"rnai_pheno": "checked", "person_id": "twoundefined"})
    assert abc_calls["plan"].call_args.args[4] == UNKNOWN_AUTHOR


def test_unresolved_entity_topics_are_protected(abc_calls):
    abc_calls["answers"].return_value = ([], [("ATP:0000027", "afp_strain: unresolved strain name X")])
    sync_paper_to_abc(FakeDB(), PAPER, {"strains_list": "X", "person_id": "two100"})
    assert abc_calls["plan"].call_args.kwargs["protect"] == {"ATP:0000027"}


def test_deleted_validated_tags_are_logged(abc_calls, caplog):
    abc_calls["plan"].return_value = TagBatch(delete=[5], deleted_validated=[
        {"topic_entity_tag_id": 5, "topic": "ATP:0000082", "validation_by_professional_biocurator": "validated_wrong"}])
    with caplog.at_level(logging.INFO):
        sync_paper_to_abc(FakeDB(), PAPER, {"rnai_pheno": "", "person_id": "two100"})
    assert "deleting validated ACKnowledge_form tag 5" in caplog.text and "validated_wrong" in caplog.text


@pytest.mark.parametrize("raw,fullname,expected", [
    ("two100", "Jane Doe", "WBPerson100"), ("twoundefined", "Jane Doe", UNKNOWN_AUTHOR),
    ("", "Jane Doe", UNKNOWN_AUTHOR), (None, "Jane Doe", UNKNOWN_AUTHOR), ("two100", "", UNKNOWN_AUTHOR),
    ("two100'; DROP", "Jane Doe", UNKNOWN_AUTHOR)])
def test_resolve_saver(raw, fullname, expected):
    db = FakeDB()
    db.person.get_fullname_from_personid.return_value = fullname
    assert resolve_saver(db, raw) == expected


def test_form_field_tables_cover_every_written_field():
    import inspect
    import re
    source = inspect.getsource(submission_form.FeedbackFormWriter)
    written = set(re.findall(r'"(\w+)" in (?:req\.)?media', source))
    assert written - NON_ANSWER_FIELDS == set(FORM_FIELD_TABLES)


def test_saves_of_a_paper_are_serialised_before_any_write():
    # "save all" posts every unsaved widget at once: without a per-paper lock two first saves of one contributor
    # both plan a full copy and the second batch fails (review I1)
    db = FakeDB()
    post(db, {"rnai_pheno": "checked", "person_id": "two100"})
    calls = [name for name, args, _ in db.afp.mock_calls]
    lock = calls.index("curs.execute")
    sql, params = db.afp.mock_calls[lock].args
    assert "pg_advisory_xact_lock" in sql and params == (submission_form.SAVE_LOCK_NAMESPACE, 1)
    assert all(not name.startswith("set_") for name in calls[:lock])
    assert calls.index("set_submitted_rnai_pheno") > lock
