import logging
import re
from typing import Dict, List, Optional, Tuple

from wbtools.literature.abc_tags import ACK_PIPELINE_SOURCE_METHOD, get_abc_curie, get_abc_paper_tags

logger = logging.getLogger(__name__)

TFP_KEYS = {"gene": "genes", "allele": "alleles", "strain": "strains", "transgene": "transgenes",
            "species": "species"}
# tfp_* table suffix of each tfp values key
TFP_TABLES = {"genes": "genestudied", "alleles": "variation", "strains": "strain", "transgenes": "transgene",
              "species": "species"}
TFP_SEPARATOR = " | "
# timeout of the ABC calls made while an author or a curator waits for a page
INTERACTIVE_TIMEOUT = 30
PRECHECK_LEVELS = ("HIGH", "MEDIUM")
NEGATIVE_LEVEL = "NEG"
WB_PAPER_ID = re.compile(r"\d+")


def kept_entities(entities, exclusion_lists) -> Dict[str, List[Tuple[str, str]]]:
    """Select the entities ACKnowledge pre-populates from the ABC entities of a paper.

    A name equal to the curie, or empty, is treated as missing: the short id is used, and species without a real name
    are dropped. Entities in the exclusion lists are dropped: by name, and by taxon id for species. Each curie is kept
    once, with the first name seen.

    Returns:
        the (curie, name) pairs by entity type, sorted by name
    """
    kept = {}
    for entity_type in TFP_KEYS:
        excluded = set(exclusion_lists.get(entity_type) or [])
        by_curie = {}
        for entity, name in entities.get(entity_type, []):
            short_id = entity.split(":", 1)[1]
            # the ABC returns the curie itself as the name when it cannot resolve it
            if not name or name == entity:
                if entity_type == "species":
                    logger.warning(f"ABC species {entity} has no name, skipping it")
                    continue
                logger.warning(f"ABC {entity_type} {entity} has no name, using its id")
                name = short_id
            if (short_id if entity_type == "species" else name) in excluded:
                continue
            by_curie.setdefault(entity, name)
        kept[entity_type] = sorted(by_curie.items(), key=lambda curie_name: (curie_name[1], curie_name[0]))
    return kept


def format_tfp_values(kept) -> Dict[str, List[str]]:
    """Format kept entities as the tfp_* values: "<id>;%;<name>" (genes without the WBGene prefix), species by name."""
    values = {}
    for entity_type, key in TFP_KEYS.items():
        pairs = kept.get(entity_type, [])
        if entity_type == "species":
            values[key] = sorted({name for _, name in pairs})
        else:
            values[key] = [f"{_tfp_id(entity_type, curie)};%;{name}" for curie, name in pairs]
    return values


def to_tfp_values(entities, exclusion_lists) -> Dict[str, List[str]]:
    """Convert the ABC entities of a paper to the values ACKnowledge stores in the tfp_* tables."""
    return format_tfp_values(kept_entities(entities, exclusion_lists))


def _tfp_id(entity_type, curie):
    short_id = curie.split(":", 1)[1]
    return short_id.replace("WBGene", "", 1) if entity_type == "gene" else short_id


def get_ack_pipeline_tags(wb_paper_id) -> Optional[dict]:
    """Get the ABC tags of a WB paper for an interactive page.

    Returns None, with a warning, if the paper is not in the ABC or the ABC can't be reached: the pages then keep the
    Caltech values.
    """
    # the id goes into an ABC URL fetched with the admin token: only plain WB paper numbers
    if not isinstance(wb_paper_id, str) or not WB_PAPER_ID.fullmatch(wb_paper_id):
        logger.warning(f"Not a WB paper id: {wb_paper_id!r}")
        return None
    try:
        curie = get_abc_curie(wb_paper_id, timeout=INTERACTIVE_TIMEOUT)
        if curie is None:
            logger.warning(f"WBPaper{wb_paper_id} is not in the ABC")
            return None
        return get_abc_paper_tags([curie], timeout=INTERACTIVE_TIMEOUT)[curie]
    except Exception as e:  # any failure, e.g. missing Cognito credentials, must not break the page
        logger.warning(f"ABC tags unavailable for WBPaper{wb_paper_id}: {e}")
        return None


def ack_pipeline_levels(tags, datatype_topics) -> Dict[str, str]:
    """Get what ACKnowledge pre-checked for each datatype, from the paper's ACKnowledge_pipeline classification tags.

    A positive tag gives its level (HIGH or MEDIUM), a negated one "NEG". Datatypes without a tag are left out. The
    result is empty if the paper has no ACKnowledge_pipeline classification tags: the caller then keeps the Caltech
    values.
    """
    classifications = tags["classifications"][ACK_PIPELINE_SOURCE_METHOD]
    levels = {}
    for datatype, topic in datatype_topics.items():
        classification = classifications.get(topic)
        if classification is None:
            continue
        if classification["negated"]:
            levels[datatype] = NEGATIVE_LEVEL
        else:
            level = (classification["confidence_level"] or "").upper()
            levels[datatype] = level if level in PRECHECK_LEVELS else PRECHECK_LEVELS[-1]
    return levels


def ack_pipeline_tfp_strings(tags) -> Optional[Dict[str, str]]:
    """Get the entities ACKnowledge pre-populated, from the paper's ACKnowledge_pipeline tags, as tfp_* strings.

    Returns None if the paper has no ACKnowledge_pipeline entity tags: the caller then keeps the Caltech tfp_* values.
    The exclusion lists are not applied again: the pipeline applied them when it wrote the tags.
    """
    if not tags["has_ack_pipeline_entity_tags"]:
        return None
    values = format_tfp_values(kept_entities(tags["entities"][ACK_PIPELINE_SOURCE_METHOD], {}))
    return {table: TFP_SEPARATOR.join(values[key]) for key, table in TFP_TABLES.items()}
