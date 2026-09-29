import logging
from typing import Dict, List, Tuple

logger = logging.getLogger(__name__)

TFP_KEYS = {"gene": "genes", "allele": "alleles", "strain": "strains", "transgene": "transgenes",
            "species": "species"}


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
