import logging
from datetime import date, timedelta
from itertools import islice

from wbtools.literature.abc_search import get_wb_paper_ids_from_abc

logger = logging.getLogger(__name__)

LOAD_BATCH_SIZE = 50


def load_papers_from_abc(corpus_manager, db_name, db_user, db_password, db_host, selection_config, num_papers,
                         today=None):
    """Load into corpus_manager up to num_papers WB papers selected from the ABC.

    Candidates are the WB papers created in the configured window that have all the required ABC workflow tags,
    newest first. They are loaded in batches through the corpus manager, which skips the papers already
    processed by ACKnowledge and the ones that are not curatable. Errors from the ABC (ABCRequestError)
    propagate: they stop the run before any paper is processed.
    """
    today = today or date.today()
    date_created_from = (today - timedelta(days=selection_config["date_created_window_days"])).isoformat()
    found = get_wb_paper_ids_from_abc(required_workflow_tags=selection_config["required_workflow_tags"],
                                      date_created_from=date_created_from, date_created_to=today.isoformat())
    candidates = _unique_papers(found)
    while corpus_manager.size() < num_papers:
        batch = list(islice(candidates, LOAD_BATCH_SIZE))
        if not batch:
            break
        logger.info(f"Loading {len(batch)} candidate papers selected from ABC")
        corpus_manager.load_from_wb_database(
            db_name, db_user, db_password, db_host, paper_ids=[wb_paper_id for wb_paper_id, _ in batch],
            max_num_papers=num_papers, agr_curies=dict(batch),
            text_source="abc_markdown", must_be_autclass_flagged=False, exclude_afp_processed=True,
            exclude_afp_not_curatable=True, exclude_no_main_text=True, exclude_no_author_email=True,
            exclude_temp_pdf=True)
    logger.info(f"{corpus_manager.size()} papers selected from ABC")


def _unique_papers(found):
    # the ABC search can return a paper twice when references are created while it is paged
    seen = set()
    for wb_paper_id, agr_curie in found:
        if wb_paper_id not in seen:
            seen.add(wb_paper_id)
            yield wb_paper_id, agr_curie
