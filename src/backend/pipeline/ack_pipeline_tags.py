import logging
from typing import List

logger = logging.getLogger(__name__)

ENTITY_TOPICS = {"gene": "ATP:0000005", "allele": "ATP:0000285", "strain": "ATP:0000027",
                 "transgene": "ATP:0000110", "species": "ATP:0000123"}
# the conventions of the ABC entity extractor and of the imported ACKnowledge tags
ENTITY_DATA_NOVELTY = "ATP:0000334"
ENTITY_DATA_CONTEXT = "ATP:0000325"
NO_ENTITY_DATA_CONTEXT = "ATP:0000323"
# the values of the ABC WB classifier tags, used if a classifier tag lacks them (the ABC requires data_novelty)
CLASSIFICATION_DATA_NOVELTY = "ATP:0000335"
CLASSIFICATION_DATA_CONTEXT = "ATP:0000323"


def build_ack_pipeline_tags(paper_id, kept, entity_tag_fields, classifications, classification_config,
                            tag_source) -> List[dict]:
    """Build the ACKnowledge_pipeline tags that record what the pipeline pre-populates for a paper (SCRUM-6608).

    Args:
        paper_id: the WB paper id, for the logs
        kept: the pre-populated entities, as returned by kept_entities
        entity_tag_fields: the fields of the abc_entity_extractor tag of each entity, by curie
        classifications: the latest abc_document_classifier tag of each topic
        classification_config: config["abc_classifications"] (datatype_topics, precheck_levels)
        tag_source: config["ack_pipeline_tags"] (tag_source_id, created_by)

    Returns:
        the entity tags, then the classification tags, as ABC tag payloads without reference_curie
    """
    return (_entity_tags(kept, entity_tag_fields, tag_source)
            + _classification_tags(paper_id, classifications, classification_config, tag_source))


def _entity_tags(kept, entity_tag_fields, tag_source):
    tags = []
    for entity_type, topic in ENTITY_TOPICS.items():
        pairs = kept.get(entity_type) or []
        if not pairs:
            # "none found": nothing of this type is pre-populated, including when the exclusion lists removed it all
            tags.append(_tag(tag_source, topic=topic, negated=True, data_novelty=ENTITY_DATA_NOVELTY,
                             data_context=NO_ENTITY_DATA_CONTEXT))
            continue
        for curie, _ in pairs:
            fields = entity_tag_fields.get(curie) or {}
            # the topic is always the type's, e.g. classical allele even when the extractor used ATP:0000006
            tags.append(_tag(tag_source, topic=topic, entity_type=topic, entity=curie,
                             species=fields.get("species"), entity_id_validation=fields.get("entity_id_validation"),
                             negated=False, data_novelty=fields.get("data_novelty") or ENTITY_DATA_NOVELTY,
                             data_context=fields.get("data_context") or ENTITY_DATA_CONTEXT))
    return tags


def _classification_tags(paper_id, classifications, classification_config, tag_source):
    precheck_levels = {level.upper() for level in classification_config["precheck_levels"]}
    tags = []
    for datatype, topic in classification_config["datatype_topics"].items():
        classification = classifications.get(topic)
        if classification is None:
            logger.warning(f"No ABC classifier tag for {datatype} ({topic}) in paper {paper_id}, no "
                           f"ACKnowledge_pipeline tag written for it")
            continue
        level = classification.get("confidence_level")
        pre_checked = not classification["negated"] and (level or "").upper() in precheck_levels
        tags.append(_tag(tag_source, topic=topic, negated=not pre_checked, confidence_level=level,
                         confidence_score=classification.get("confidence_score"),
                         data_novelty=classification.get("data_novelty") or CLASSIFICATION_DATA_NOVELTY,
                         data_context=classification.get("data_context") or CLASSIFICATION_DATA_CONTEXT))
    return tags


def _tag(tag_source, **fields):
    tag = {"tag_source_id": tag_source["tag_source_id"], "created_by": tag_source["created_by"],
           "updated_by": tag_source["created_by"]}
    tag.update({field: value for field, value in fields.items() if value is not None})
    return tag
