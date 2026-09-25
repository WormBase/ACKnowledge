from datetime import date
from unittest import mock

import pytest

from wbtools.literature.paper import ABCRequestError

from src.backend.pipeline.abc_paper_selection import load_papers_from_abc, LOAD_BATCH_SIZE

SELECTION_CONFIG = {"date_created_window_days": 730,
                    "required_workflow_tags": {"file_workflow": ["ATP:0000163"],
                                               "email_extraction": ["ATP:0000355"]}}


class FakeCorpusManager:
    """records load_from_wb_database calls and adds the first papers_added_per_call ids of each batch"""

    def __init__(self, papers_added_per_call=0):
        self.papers_added_per_call = papers_added_per_call
        self.calls = []
        self.papers = []

    def size(self):
        return len(self.papers)

    def load_from_wb_database(self, db_name, db_user, db_password, db_host, **kwargs):
        self.calls.append(kwargs)
        for paper_id in kwargs["paper_ids"][:self.papers_added_per_call]:
            if kwargs.get("max_num_papers") and self.size() >= kwargs["max_num_papers"]:
                break
            self.papers.append(paper_id)


def candidates(count, start=1):
    return [(f"{i:08d}", f"AGRKB:{i}") for i in range(start, start + count)]


def run(corpus_manager, found, num_papers=10):
    with mock.patch("src.backend.pipeline.abc_paper_selection.get_wb_paper_ids_from_abc",
                    return_value=iter(found)) as search:
        load_papers_from_abc(corpus_manager, "db", "user", "pw", "host", SELECTION_CONFIG, num_papers,
                             today=date(2026, 9, 24))
    return search


def test_search_uses_config_tags_and_window():
    search = run(FakeCorpusManager(), candidates(1))
    search.assert_called_once_with(required_workflow_tags=SELECTION_CONFIG["required_workflow_tags"],
                                   date_created_from="2024-09-24", date_created_to="2026-09-24")


def test_batches_are_loaded_with_the_abc_filters():
    cm = FakeCorpusManager()
    run(cm, candidates(3), num_papers=5)
    assert cm.calls == [{"paper_ids": ["00000001", "00000002", "00000003"], "max_num_papers": 5,
                         "text_source": "abc_markdown", "must_be_autclass_flagged": False,
                         "exclude_afp_processed": True, "exclude_afp_not_curatable": True,
                         "exclude_no_main_text": True, "exclude_no_author_email": True, "exclude_temp_pdf": True}]


def test_candidates_are_loaded_in_batches():
    cm = FakeCorpusManager()
    run(cm, candidates(LOAD_BATCH_SIZE + 20), num_papers=10)
    assert [len(call["paper_ids"]) for call in cm.calls] == [LOAD_BATCH_SIZE, 20]


def test_stops_once_enough_papers_are_loaded():
    cm = FakeCorpusManager(papers_added_per_call=4)
    run(cm, candidates(LOAD_BATCH_SIZE * 3), num_papers=6)
    assert len(cm.calls) == 2
    assert cm.size() == 6


def test_stops_when_candidates_run_out():
    cm = FakeCorpusManager(papers_added_per_call=1)
    run(cm, candidates(3), num_papers=10)
    assert len(cm.calls) == 1
    assert cm.size() == 1


def test_duplicate_candidates_are_loaded_once():
    cm = FakeCorpusManager()
    run(cm, candidates(2) + candidates(2) + candidates(1, start=3), num_papers=10)
    loaded = [paper_id for call in cm.calls for paper_id in call["paper_ids"]]
    assert loaded == ["00000001", "00000002", "00000003"]


def test_abc_errors_propagate():
    cm = FakeCorpusManager()
    with mock.patch("src.backend.pipeline.abc_paper_selection.get_wb_paper_ids_from_abc",
                    side_effect=ABCRequestError("search down")):
        with pytest.raises(ABCRequestError):
            load_papers_from_abc(cm, "db", "user", "pw", "host", SELECTION_CONFIG, 10, today=date(2026, 9, 24))
