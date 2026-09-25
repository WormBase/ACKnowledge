import logging

from wbtools.literature.abc_entities import get_abc_extracted_entities

logger = logging.getLogger(__name__)

TFP_KEYS = {"gene": "genes", "allele": "alleles", "strain": "strains", "transgene": "transgenes",
            "species": "species"}


def to_tfp_values(entities, exclusion_lists):
    """Convert the ABC entities of a paper to the values ACKnowledge stores in the tfp_* tables.

    Genes, alleles, strains and transgenes become "<id>;%;<name>" (genes without the WBGene prefix), species are
    stored by name. Entities in the ACKnowledge exclusion lists are dropped: by name, and by taxon id for species.
    """
    values = {}
    for entity_type, key in TFP_KEYS.items():
        excluded = set(exclusion_lists.get(entity_type) or [])
        by_id = {}
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
            by_id.setdefault(entity, (short_id, name))
        if entity_type == "species":
            values[key] = sorted({name for _, name in by_id.values()})
        else:
            if entity_type == "gene":
                by_id = {entity: (short_id.replace("WBGene", "", 1), name) for entity, (short_id, name) in
                         by_id.items()}
            values[key] = [f"{short_id};%;{name}" for short_id, name in
                           sorted(by_id.values(), key=lambda id_name: (id_name[1], id_name[0]))]
    return values


def get_tfp_values_for_papers(papers, exclusion_lists):
    """Get the tfp_* values of the papers from the entities extracted by the ABC, keyed by paper id."""
    papers = list(papers)
    if not papers:
        return {}
    entities = get_abc_extracted_entities([paper.agr_curie for paper in papers])
    tfp_values = {}
    for paper in papers:
        values = to_tfp_values(entities.get(paper.agr_curie, {}), exclusion_lists)
        logger.info(f"Entities from ABC for paper {paper.paper_id}: "
                    + ", ".join(f"{len(values[key])} {key}" for key in TFP_KEYS.values()))
        tfp_values[paper.paper_id] = values
    return tfp_values
