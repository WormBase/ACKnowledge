"""Write the author answers of an ACKnowledge save to the ABC as ACKnowledge_form tags (SCRUM-4141).

Called inside the save's open Caltech transaction, after the afp_* writes: the paper's answer set is computed from
what that transaction wrote, compared with every contributor's ACKnowledge_form tags in the ABC, and the changes are
sent as one ABC batch. Any ABC failure raises, so the caller rolls Caltech back: both are saved or neither is.
"""
import logging
import re
from typing import Dict, List, Optional

from wbtools.literature.abc_tags import get_abc_curie
from wbtools.literature.ack_form.changes import (UNKNOWN_AUTHOR, answer_set, contributors, plan_changes,
                                                 section_keys)
from wbtools.literature.ack_form.abc import get_ack_form_source_id, get_ack_form_tags, send_tag_batch
from wbtools.literature.ack_form.paper_data import load_paper_data
from wbtools.literature.paper import ABCRequestError

from src.backend.common.abc_paper_data import INTERACTIVE_TIMEOUT

logger = logging.getLogger(__name__)

# the afp_* tables each field of a save request writes (FeedbackFormWriter.on_post)
FORM_FIELD_TABLES: Dict[str, List[str]] = {
    "gene_list": ["afp_genestudied"],
    "gene_model_update": ["afp_structcorr"],
    "species_list": ["afp_species"],
    "other_species": ["afp_otherspecies"],
    "alleles_list": ["afp_variation"],
    "allele_seq_change": ["afp_seqchange"],
    "other_alleles": ["afp_othervariation"],
    "strains_list": ["afp_strain"],
    "other_strains": ["afp_otherstrain"],
    "transgenes_list": ["afp_transgene"],
    "new_transgenes": ["afp_othertransgene"],
    "new_antibody": ["afp_antibody"],
    "other_antibodies": ["afp_otherantibody"],
    "anatomic_expr": ["afp_otherexpr"],
    "site_action": ["afp_siteaction"],
    "time_action": ["afp_timeaction"],
    "gene_int": ["afp_geneint"],
    "phys_int": ["afp_geneprod"],
    "gene_reg": ["afp_genereg"],
    "allele_pheno": ["afp_newmutant"],
    "rnai_pheno": ["afp_rnai"],
    "transover_pheno": ["afp_overexpr"],
    "chemical": ["afp_chemphen"],
    "env": ["afp_envpheno"],
    "protein": ["afp_catalyticact"],
    "othergenefunc": ["afp_othergenefunc"],
    "disease": ["afp_humdis"],
}
# request fields that write no answer of a mapped section
NON_ANSWER_FIELDS = {"passwd", "person_id", "comments", "disease_list"}
PERSON_ID = re.compile(r"two(\d+)")


def resolve_saver(db, raw_person_id: Optional[str]) -> str:
    """the WBPerson of the person saving, or unknown_author when the form sent none, "twoundefined", something that
    is not a person id, or a person Caltech does not know"""
    match = PERSON_ID.fullmatch((raw_person_id or "").strip())
    if match is None:
        return UNKNOWN_AUTHOR
    fullname = db.person.get_fullname_from_personid(match.group(0))
    if not fullname or not fullname.strip() or fullname == "Unknown user":
        return UNKNOWN_AUTHOR
    return "WBPerson" + match.group(1)


def saved_tables(media: dict) -> List[str]:
    return sorted({table for field, tables in FORM_FIELD_TABLES.items() if field in media for table in tables})


def sync_paper_to_abc(db, paper_id: str, media: dict) -> bool:
    """send the ABC changes of this save as one batch; returns whether a batch was sent

    Raises:
        ABCRequestError: if the paper is not in the ABC or the ABC can't be read or refuses the batch
    """
    tables = saved_tables(media)
    if not tables:
        return False
    curie = get_abc_curie(paper_id, timeout=INTERACTIVE_TIMEOUT)
    if curie is None:
        raise ABCRequestError(f"WBPaper{paper_id} is not in the ABC")
    data = load_paper_data(db.afp.curs, paper_id)
    template, problems = answer_set(paper_id, curie, data)
    for topic, problem in problems:
        logger.warning(f"WBPaper{paper_id} {topic}: {problem}")
    abc_tags = get_ack_form_tags(curie, timeout=INTERACTIVE_TIMEOUT)
    saver = resolve_saver(db, media.get("person_id"))
    batch = plan_changes(template, abc_tags, contributors(data, paper_id, abc_tags, saver), section_keys(tables),
                         saver, get_ack_form_source_id(timeout=INTERACTIVE_TIMEOUT),
                         protect={topic for topic, _ in problems})
    if batch.is_empty():
        return False
    for tag in batch.deleted_validated:
        logger.info(f"WBPaper{paper_id}: deleting validated ACKnowledge_form tag {tag.get('topic_entity_tag_id')} "
                    f"(topic {tag.get('topic')}, entity {tag.get('entity')}, validation_by_author "
                    f"{tag.get('validation_by_author')}, validation_by_professional_biocurator "
                    f"{tag.get('validation_by_professional_biocurator')})")
    send_tag_batch(curie, batch, timeout=INTERACTIVE_TIMEOUT)
    logger.info(f"WBPaper{paper_id}: ABC batch sent by {saver}: {len(batch.create)} created, "
                f"{len(batch.update)} updated, {len(batch.delete)} deleted")
    return True
