from src.backend.pipeline.ack_pipeline_tags import build_ack_pipeline_tags

TAG_SOURCE = {"tag_source_id": 159, "created_by": "ACKnowledge_pipeline"}
CLASSIFICATION_CONFIG = {"datatype_topics": {"rnai": "ATP:0000082", "otherexpr": "ATP:0000041",
                                             "geneint": "ATP:0000068", "geneprod": "ATP:0000069"},
                         "precheck_levels": ["HIGH", "MEDIUM"]}
AUDIT = {"tag_source_id": 159, "created_by": "ACKnowledge_pipeline", "updated_by": "ACKnowledge_pipeline"}
EMPTY_KEPT = {"gene": [], "allele": [], "strain": [], "transgene": [], "species": []}
GENE_FIELDS = {"topic": "ATP:0000005", "entity_type": "ATP:0000005", "species": "NCBITaxon:6239",
               "entity_id_validation": "alliance", "data_novelty": "ATP:0000334", "data_context": "ATP:0000325"}


def classification(level, negated=False, score=0.8):
    return {"negated": negated, "confidence_level": level, "confidence_score": score, "data_novelty": "ATP:0000335",
            "data_context": "ATP:0000323", "ml_model_version": 2, "date_created": "2026-05-07T00:00:00"}


def build(kept=None, fields=None, classifications=None):
    return build_ack_pipeline_tags("00000001", dict(EMPTY_KEPT, **(kept or {})), fields or {},
                                   classifications or {}, CLASSIFICATION_CONFIG, TAG_SOURCE)


ENTITY_TOPICS = ("ATP:0000005", "ATP:0000285", "ATP:0000027", "ATP:0000110", "ATP:0000123")


def entity_tags(tags):
    return [tag for tag in tags if tag["topic"] in ENTITY_TOPICS]


def test_entity_tags_copy_the_extractor_tag_fields():
    tags = build(kept={"gene": [("WB:WBGene00002974", "lev-1")]}, fields={"WB:WBGene00002974": GENE_FIELDS})
    assert dict(GENE_FIELDS, entity="WB:WBGene00002974", negated=False, **AUDIT) in tags


def test_missing_fields_get_the_entity_defaults():
    tags = build(kept={"strain": [("WB:WBStrain00043982", "N2")]},
                 fields={"WB:WBStrain00043982": {"topic": None, "entity_type": None, "species": None,
                                                 "entity_id_validation": None, "data_novelty": None,
                                                 "data_context": None}})
    assert dict(AUDIT, topic="ATP:0000027", entity_type="ATP:0000027", entity="WB:WBStrain00043982", negated=False,
                data_novelty="ATP:0000334", data_context="ATP:0000325") in tags


def test_empty_types_get_one_negated_tag_each():
    tags = entity_tags(build(kept={"gene": [("WB:WBGene00002974", "lev-1")]},
                             fields={"WB:WBGene00002974": GENE_FIELDS}))
    negated = sorted(tag["topic"] for tag in tags if tag["negated"])
    assert negated == ["ATP:0000027", "ATP:0000110", "ATP:0000123", "ATP:0000285"]
    assert dict(AUDIT, topic="ATP:0000285", negated=True, data_novelty="ATP:0000334",
                data_context="ATP:0000323") in tags


def test_all_entities_excluded_gives_a_negated_tag():
    # the extractor found strains, but the exclusion lists removed them all: kept is empty for strain
    tags = entity_tags(build(fields={"WB:WBStrain00043982": dict(GENE_FIELDS, topic="ATP:0000027")}))
    strain_tags = [tag for tag in tags if tag["topic"] == "ATP:0000027"]
    assert strain_tags == [dict(AUDIT, topic="ATP:0000027", negated=True, data_novelty="ATP:0000334",
                                data_context="ATP:0000323")]


def test_classification_positive_only_for_precheck_levels():
    tags = build(classifications={"ATP:0000082": classification("HIGH"),
                                  "ATP:0000041": classification("LOW", score=0.61),
                                  "ATP:0000068": classification("HIGH", negated=True),
                                  "ATP:0000069": classification("medium")})
    by_topic = {tag["topic"]: tag for tag in tags if tag["topic"] in ("ATP:0000082", "ATP:0000041", "ATP:0000068",
                                                                      "ATP:0000069")}
    assert by_topic["ATP:0000082"] == dict(AUDIT, topic="ATP:0000082", negated=False, confidence_level="HIGH",
                                           confidence_score=0.8, data_novelty="ATP:0000335",
                                           data_context="ATP:0000323")
    assert by_topic["ATP:0000041"]["negated"] is True
    assert (by_topic["ATP:0000041"]["confidence_level"], by_topic["ATP:0000041"]["confidence_score"]) == ("LOW", 0.61)
    assert by_topic["ATP:0000068"]["negated"] is True
    assert by_topic["ATP:0000069"]["negated"] is False
    assert all("entity" not in by_topic[topic] for topic in by_topic)


def test_datatype_without_classifier_tag_gets_no_tag(caplog):
    tags = build(classifications={"ATP:0000082": classification("HIGH")})
    topics = {tag["topic"] for tag in tags}
    assert "ATP:0000082" in topics
    assert not topics & {"ATP:0000041", "ATP:0000068", "ATP:0000069"}
    assert "No ABC classifier tag for otherexpr (ATP:0000041) in paper 00000001" in caplog.text


def test_entity_tags_come_first():
    tags = build(kept={"gene": [("WB:WBGene00002974", "lev-1")]}, fields={"WB:WBGene00002974": GENE_FIELDS},
                 classifications={"ATP:0000082": classification("HIGH")})
    assert tags[0]["topic"] == "ATP:0000005"
    assert tags[-1]["topic"] == "ATP:0000082"


def test_entity_topic_is_the_type_topic_whatever_the_extractor_topic():
    # the extractor can tag an allele with the generic allele topic (ATP:0000006): ACKnowledge records it as a
    # classical allele (ATP:0000285), like the imported tags
    tags = build(kept={"allele": [("WB:WBVar00088809", "md176")]},
                 fields={"WB:WBVar00088809": {"topic": "ATP:0000006", "entity_type": "ATP:0000006",
                                              "species": "NCBITaxon:6239", "data_novelty": "ATP:0000334",
                                              "data_context": "ATP:0000325"}})
    allele = [tag for tag in tags if tag.get("entity") == "WB:WBVar00088809"]
    assert [(tag["topic"], tag["entity_type"]) for tag in allele] == [("ATP:0000285", "ATP:0000285")]
    assert allele[0]["species"] == "NCBITaxon:6239"


def test_classification_without_novelty_or_context_gets_the_classifier_defaults():
    # the ABC rejects a tag without data_novelty
    rnai = dict(classification("HIGH"), data_novelty=None, data_context=None)
    tags = build(classifications={"ATP:0000082": rnai})
    tag = [t for t in tags if t["topic"] == "ATP:0000082"][0]
    assert (tag["data_novelty"], tag["data_context"]) == ("ATP:0000335", "ATP:0000323")
