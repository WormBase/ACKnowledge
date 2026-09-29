import logging

from wbtools.literature.abc_entities import ENTITY_EXTRACTOR_SOURCE_METHOD
from wbtools.literature.abc_tags import DOCUMENT_CLASSIFIER_SOURCE_METHOD, get_abc_paper_tags

from src.backend.common.abc_paper_data import TFP_KEYS, format_tfp_values, kept_entities
from src.backend.pipeline.ack_pipeline_tags import build_ack_pipeline_tags

logger = logging.getLogger(__name__)


def get_tfp_values_for_papers(papers, exclusion_lists, classification_config, tag_source):
    """Get what the pipeline pre-populates for each paper from its ABC tags, keyed by paper id.

    The entities come from the ABC entity extractor, after the exclusion lists. The classifications come from the ABC
    WB classifiers. For each paper, the result holds the tfp_* values and "ack_pipeline_tags", the
    ACKnowledge_pipeline tags that record the same entities and the pre-checked datatypes (SCRUM-6608). Errors from
    the ABC (ABCRequestError) propagate.
    """
    papers = list(papers)
    if not papers:
        return {}
    paper_tags = get_abc_paper_tags([paper.agr_curie for paper in papers])
    values_by_paper = {}
    for paper in papers:
        tags = paper_tags[paper.agr_curie]
        kept = kept_entities(tags["entities"][ENTITY_EXTRACTOR_SOURCE_METHOD], exclusion_lists)
        values = format_tfp_values(kept)
        values["ack_pipeline_tags"] = build_ack_pipeline_tags(
            paper.paper_id, kept, tags["entity_tag_fields"][ENTITY_EXTRACTOR_SOURCE_METHOD],
            tags["classifications"][DOCUMENT_CLASSIFIER_SOURCE_METHOD], classification_config, tag_source)
        logger.info(f"Entities from ABC for paper {paper.paper_id}: "
                    + ", ".join(f"{len(values[key])} {key}" for key in TFP_KEYS.values())
                    + f"; {len(values['ack_pipeline_tags'])} ACKnowledge_pipeline tags to write")
        values_by_paper[paper.paper_id] = values
    return values_by_paper
