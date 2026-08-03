import re

from contextlib import contextmanager
from datetime import datetime, timedelta, timezone

from src.backend.pipeline.partial_submissions_digest import (
    get_partial_submissions,
    get_widgets_info_for_papers,
    format_report_rows,
)

# Prod returns 'timestamp with time zone' columns, so psycopg2 hands back
# aware datetimes. The fixtures mirror that: a naive fixture would let an
# aware/naive comparison bug pass the tests and fail on the monthly cron.
PDT = timezone(timedelta(hours=-7))


class FakeConnection:
    """Models psycopg2's aborted-transaction behaviour.

    wbtools' get_cursor() hands out one shared cursor per connection and never
    rolls back, so a failed statement leaves the transaction aborted and every
    later one raises until something calls rollback(). A fake that forgets this
    lets a connection-poisoning bug pass the suite while emptying the report in
    production.
    """

    def __init__(self):
        self.aborted = False
        self.rollbacks = 0

    def rollback(self):
        self.aborted = False
        self.rollbacks += 1


class FakeCursor:
    """Cursor over an in-memory {table: {joinkey: timestamp}} fixture."""

    def __init__(self, conn, tables, broken_tables):
        self.conn = conn
        self.tables = tables
        self.broken_tables = broken_tables
        self.rows = []

    def execute(self, query, params=None):
        if self.conn.aborted:
            raise RuntimeError("current transaction is aborted, commands ignored "
                               "until end of transaction block")
        table = re.search(r"FROM (\w+)", query).group(1)
        if table in self.broken_tables:
            self.conn.aborted = True
            raise RuntimeError('relation "{}" does not exist'.format(table))
        joinkeys = set(params[0]) if params else set()
        self.rows = [(joinkey, timestamp) for joinkey, timestamp
                     in self.tables.get(table, {}).items() if joinkey in joinkeys]

    def fetchall(self):
        return self.rows


class FakeAFP:
    def __init__(self, partial_ids):
        self.partial_ids = partial_ids

    def get_paper_ids_afp_partial_submission(self):
        return list(self.partial_ids)

    def get_afp_form_link(self, paper_id, afp_base_url):
        return "{}?paper={}&passwd=secret".format(afp_base_url, paper_id)


class FakePaper:
    def get_paper_title(self, paper_id):
        return "Title of {}".format(paper_id)

    def get_paper_journal(self, paper_id):
        return "Journal of {}".format(paper_id)

    def get_pmid(self, paper_id):
        return "PMID{}".format(paper_id)


class FakeDBManager:
    """Mimics the WBDBManager surface the digest is allowed to rely on.

    Deliberately exposes only get_cursor() plus the afp/paper sub-managers -
    the real class has no execute_query(), which is what silently emptied
    the report for six months.
    """

    def __init__(self, partial_ids=(), tables=None, broken_tables=()):
        self.afp = FakeAFP(partial_ids)
        self.paper = FakePaper()
        self.conn = FakeConnection()
        self.tables = tables or {}
        self.broken_tables = set(broken_tables)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    @contextmanager
    def get_cursor(self):
        yield FakeCursor(self.conn, self.tables, self.broken_tables)


def test_widget_info_counts_categories_backed_by_rows():
    db = FakeDBManager(tables={
        "afp_genestudied": {"00001": datetime(2026, 7, 2, tzinfo=PDT)},
        "afp_humdis": {"00001": datetime(2026, 7, 3, tzinfo=PDT)},
    })
    info = get_widgets_info_for_papers(db, ["00001"])["00001"]

    assert info["total_completed"] == 2
    assert info["widgets"]["Overview"] is True
    assert info["widgets"]["Disease"] is True
    assert info["widgets"]["Genetics"] is False


def test_widget_info_counts_each_category_once():
    # Overview maps to four tables; a paper with rows in two of them has
    # completed one widget, not two.
    db = FakeDBManager(tables={
        "afp_genestudied": {"00001": datetime(2026, 7, 2, tzinfo=PDT)},
        "afp_species": {"00001": datetime(2026, 7, 4, tzinfo=PDT)},
    })
    info = get_widgets_info_for_papers(db, ["00001"])["00001"]

    assert info["total_completed"] == 1
    assert info["dates"]["Overview"] == datetime(2026, 7, 4, tzinfo=PDT)


def test_widget_info_keeps_papers_independent():
    db = FakeDBManager(tables={
        "afp_genestudied": {"00001": datetime(2026, 7, 2, tzinfo=PDT)},
        "afp_rnai": {"00002": datetime(2026, 7, 2, tzinfo=PDT)},
    })
    info = get_widgets_info_for_papers(db, ["00001", "00002"])

    assert info["00001"]["widgets"]["Overview"] is True
    assert info["00001"]["widgets"]["Phenotypes"] is False
    assert info["00002"]["widgets"]["Phenotypes"] is True
    assert info["00002"]["widgets"]["Overview"] is False


def test_broken_table_is_logged_not_swallowed(caplog):
    db = FakeDBManager(tables={"afp_genestudied": {"00001": datetime(2026, 7, 2, tzinfo=PDT)}},
                       broken_tables=["afp_humdis"])
    with caplog.at_level("WARNING"):
        info = get_widgets_info_for_papers(db, ["00001"])["00001"]

    assert info["total_completed"] == 1
    assert any("afp_humdis" in record.message for record in caplog.records)


def test_one_unreadable_table_does_not_zero_out_the_others():
    # afp_genestudied is the first table probed, so if a failure poisons the
    # shared transaction every later widget reads as empty - which is the
    # original "no partial submissions" bug wearing a different hat.
    db = FakeDBManager(
        tables={"afp_genestudied": {"00001": datetime(2026, 7, 2, tzinfo=PDT)},
                "afp_humdis": {"00001": datetime(2026, 7, 3, tzinfo=PDT)},
                "afp_comment": {"00001": datetime(2026, 7, 4, tzinfo=PDT)}},
        broken_tables=["afp_genestudied"],
    )
    info = get_widgets_info_for_papers(db, ["00001"])["00001"]

    assert info["widgets"]["Disease"] is True
    assert info["widgets"]["Comments"] is True
    assert info["total_completed"] == 2
    assert db.conn.rollbacks == 1


def test_partial_submissions_reports_papers_with_data():
    db = FakeDBManager(
        partial_ids=["00001"],
        tables={"afp_genestudied": {"00001": datetime(2026, 7, 2, tzinfo=PDT)}},
    )
    result = get_partial_submissions(db, "https://acknowledge.textpressolab.com",
                                     datetime(2025, 1, 1))

    assert len(result) == 1
    assert result[0]["paper_id"] == "00001"
    assert result[0]["total_completed"] == 1
    assert result[0]["title"] == "Title of 00001"
    assert result[0]["pmid"] == "PMID00001"
    assert result[0]["form_link"].startswith("https://acknowledge.textpressolab.com?paper=00001")


def test_partial_submissions_skips_papers_without_widget_rows():
    db = FakeDBManager(partial_ids=["00001"], tables={})
    assert get_partial_submissions(db, "https://base", datetime(2025, 1, 1)) == []


def test_start_date_excludes_papers_whose_activity_predates_it():
    db = FakeDBManager(
        partial_ids=["00001", "00002"],
        tables={"afp_genestudied": {"00001": datetime(2019, 6, 4, tzinfo=PDT),
                                    "00002": datetime(2026, 7, 2, tzinfo=PDT)}},
    )
    result = get_partial_submissions(db, "https://base", datetime(2025, 1, 1))

    assert [paper["paper_id"] for paper in result] == ["00002"]


def test_naive_start_date_compares_against_aware_timestamps():
    # datetime(2025, 1, 1) from the CLI default is naive; the DB rows are not.
    db = FakeDBManager(
        partial_ids=["00001"],
        tables={"afp_genestudied": {"00001": datetime(2026, 7, 2, tzinfo=PDT)}},
    )
    assert len(get_partial_submissions(db, "https://base", datetime(2025, 1, 1))) == 1


def test_report_rows_render_completion_dates_and_counts():
    papers = [{
        "paper_id": "00001",
        "title": "T",
        "journal": "J",
        "pmid": "1",
        "form_link": "https://base?paper=00001",
        "widgets_completed": {"Overview": True, "Genetics": False},
        "total_completed": 1,
        "completion_dates": {"Overview": datetime(2026, 7, 2, tzinfo=PDT)},
    }]
    rows = format_report_rows(papers, "https://base")

    assert "✓ Overview (2026-07-02)" in rows
    assert "○ Genetics" in rows
    assert "<b>1/8</b>" in rows
    assert 'href="https://base?paper=00001"' in rows
