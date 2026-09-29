import sys
from unittest import mock

from wbtools.literature.paper import ABCRequestError

from src.backend.pipeline import process_papers


def paper(paper_id):
    result = mock.Mock(paper_id=paper_id, agr_curie="AGRKB:" + paper_id, title="t", journal="j", pmid="p", doi="d")
    result.get_authors_with_email_address_in_wb.return_value = [(mock.Mock(person_id="1"), "author@x.org")]
    return result


def values(paper_id):
    return {"genes": [paper_id + ";%;g"], "alleles": [], "strains": [], "transgenes": [], "species": [],
            "ack_pipeline_tags": [{"topic": "ATP:0000005", "entity": "WB:WBGene" + paper_id}]}


def run(papers, create_side_effect):
    corpus = mock.Mock()
    corpus.get_all_papers.return_value = papers
    db = mock.MagicMock()
    db.afp.save_extracted_data_to_db.return_value = "123.4"
    email_manager = mock.MagicMock()
    argv = ["process_papers.py", "-N", "db", "-U", "user", "-H", "host", "-a", "admin@x.org", "-u", "https://afp"]
    with mock.patch.object(sys, "argv", argv), \
            mock.patch.object(process_papers, "CorpusManager", return_value=corpus), \
            mock.patch.object(process_papers, "WBDBManager", return_value=db), \
            mock.patch.object(process_papers, "load_papers_from_abc"), \
            mock.patch.object(process_papers, "get_tfp_values_for_papers",
                              return_value={p.paper_id: values(p.paper_id) for p in papers}), \
            mock.patch.object(process_papers, "create_topic_entity_tags", side_effect=create_side_effect) as create, \
            mock.patch.object(process_papers, "EmailManager") as email_class, \
            mock.patch.object(process_papers, "to_redirect_url", return_value="https://afp/f/x"):
        email_class.return_value = email_manager
        email_class.get_feedback_form_tiny_url.return_value = "https://tiny/x"
        process_papers.main()
    return db, email_manager, create


def fail_for(failing_curie):
    def create(agr_curie, tags):
        if agr_curie == failing_curie:
            raise ABCRequestError("ABC down")
        return len(tags)
    return create


def test_tags_are_written_before_saving_and_emailing():
    db, email_manager, create = run([paper("00000001")], fail_for(None))
    create.assert_called_once_with("AGRKB:00000001", values("00000001")["ack_pipeline_tags"])
    db.afp.save_extracted_data_to_db.assert_called_once()
    assert email_manager.send_email_to_author.call_args[0][0] == "00000001"


def test_failed_write_skips_the_paper_and_is_reported():
    db, email_manager, _ = run([paper("00000001"), paper("00000002")], fail_for("AGRKB:00000001"))
    saved = [call[1]["paper_id"] for call in db.afp.save_extracted_data_to_db.call_args_list]
    assert saved == ["00000002"]
    emailed = [call[0][0] for call in email_manager.send_email_to_author.call_args_list]
    assert emailed == ["00000002"]
    summary = email_manager.send_summary_email_to_admin.call_args[1]
    assert summary["paper_ids"] == ["00000002"]
    assert summary["abc_failed_paper_ids"] == ["00000001"]
