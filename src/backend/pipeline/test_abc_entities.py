from types import SimpleNamespace
from unittest import mock

import pytest

from wbtools.literature.abc_tags import empty_paper_tags
from wbtools.literature.paper import ABCRequestError

from src.backend.pipeline.abc_entities import get_tfp_values_for_papers

EXCLUSIONS = {"gene": ["M3", "M4", "run"], "strain": ["M9", "OH"], "allele": [], "transgene": [],
              "species": ["10090"]}
CLASSIFICATION_CONFIG = {"datatype_topics": {"rnai": "ATP:0000082"}, "precheck_levels": ["HIGH", "MEDIUM"]}
TAG_SOURCE = {"tag_source_id": 159, "created_by": "ACKnowledge_pipeline"}


def paper(paper_id, curie):
    return SimpleNamespace(paper_id=paper_id, agr_curie=curie)


def tags(genes=(), species=(), rnai_level=None):
    paper_tags = empty_paper_tags()
    for curie, name in genes:
        paper_tags["entities"]["abc_entity_extractor"]["gene"].append((curie, name))
        paper_tags["entity_tag_fields"]["abc_entity_extractor"][curie] = {"topic": "ATP:0000005"}
    for curie, name in species:
        paper_tags["entities"]["abc_entity_extractor"]["species"].append((curie, name))
        paper_tags["entity_tag_fields"]["abc_entity_extractor"][curie] = {"topic": "ATP:0000123"}
    if rnai_level:
        paper_tags["classifications"]["abc_document_classifier"]["ATP:0000082"] = {
            "negated": rnai_level == "NEG", "confidence_level": rnai_level, "confidence_score": 0.9,
            "data_novelty": "ATP:0000335", "data_context": "ATP:0000323", "ml_model_version": 2, "date_created": ""}
    return paper_tags


def values_for(found, papers):
    with mock.patch("src.backend.pipeline.abc_entities.get_abc_paper_tags", return_value=found) as abc:
        values = get_tfp_values_for_papers(papers, EXCLUSIONS, CLASSIFICATION_CONFIG, TAG_SOURCE)
    return values, abc


def test_values_for_papers_come_from_one_abc_call():
    found = {"AGRKB:1": tags(genes=[("WB:WBGene00002974", "lev-1")]), "AGRKB:2": tags()}
    values, abc = values_for(found, [paper("00000001", "AGRKB:1"), paper("00000002", "AGRKB:2")])
    abc.assert_called_once_with(["AGRKB:1", "AGRKB:2"])
    assert values["00000001"]["genes"] == ["00002974;%;lev-1"]
    assert values["00000002"]["genes"] == []


def test_tfp_values_and_tags_share_the_kept_entities():
    found = {"AGRKB:1": tags(genes=[("WB:WBGene00002974", "lev-1"), ("WB:WBGene00000003", "run")],
                             species=[("NCBITaxon:6239", "Caenorhabditis elegans"),
                                      ("NCBITaxon:7227", "NCBITaxon:7227")])}
    values, _ = values_for(found, [paper("00000001", "AGRKB:1")])
    assert values["00000001"]["genes"] == ["00002974;%;lev-1"]
    assert values["00000001"]["species"] == ["Caenorhabditis elegans"]
    entities = {tag["entity"] for tag in values["00000001"]["ack_pipeline_tags"] if "entity" in tag}
    # "run" is excluded, and the unnamed species is not pre-populated: neither gets a tag
    assert entities == {"WB:WBGene00002974", "NCBITaxon:6239"}


def test_tags_include_the_classifications():
    values, _ = values_for({"AGRKB:1": tags(rnai_level="MEDIUM")}, [paper("00000001", "AGRKB:1")])
    rnai = [tag for tag in values["00000001"]["ack_pipeline_tags"] if tag["topic"] == "ATP:0000082"]
    assert len(rnai) == 1
    assert rnai[0]["negated"] is False
    assert rnai[0]["confidence_level"] == "MEDIUM"


def test_no_papers_makes_no_abc_call():
    values, abc = values_for({}, [])
    assert values == {}
    abc.assert_not_called()


def test_abc_errors_propagate():
    with mock.patch("src.backend.pipeline.abc_entities.get_abc_paper_tags", side_effect=ABCRequestError("down")):
        with pytest.raises(ABCRequestError):
            get_tfp_values_for_papers([paper("00000001", "AGRKB:1")], EXCLUSIONS, CLASSIFICATION_CONFIG, TAG_SOURCE)
