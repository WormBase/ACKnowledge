from unittest import mock

from wbtools.literature.abc_tags import empty_paper_tags
from wbtools.literature.paper import ABCRequestError

from src.backend.common.abc_paper_data import (ack_pipeline_levels, ack_pipeline_tfp_strings, get_ack_pipeline_tags,
                                               kept_entities, to_tfp_values)
from src.backend.common.config import load_config_from_file

EXCLUSIONS = {"gene": ["M3", "M4", "run"], "strain": ["M9", "OH"], "allele": [], "transgene": [],
              "species": ["10090"]}


def entities(gene=(), allele=(), strain=(), transgene=(), species=()):
    return {"gene": list(gene), "allele": list(allele), "strain": list(strain), "transgene": list(transgene),
            "species": list(species)}


def test_tfp_formats():
    values = to_tfp_values(entities(gene=[("WB:WBGene00002974", "lev-1")],
                                    allele=[("WB:WBVar00088809", "md176")],
                                    strain=[("WB:WBStrain00000001", "N2")],
                                    transgene=[("WB:WBTransgene00016465", "leEx2996")],
                                    species=[("NCBITaxon:6239", "Caenorhabditis elegans")]), EXCLUSIONS)
    assert values == {"genes": ["00002974;%;lev-1"], "alleles": ["WBVar00088809;%;md176"],
                      "strains": ["WBStrain00000001;%;N2"], "transgenes": ["WBTransgene00016465;%;leEx2996"],
                      "species": ["Caenorhabditis elegans"]}


def test_exclusion_lists_apply_by_name_and_species_by_taxon_id():
    values = to_tfp_values(entities(gene=[("WB:WBGene00000001", "run"), ("WB:WBGene00000002", "unc-119")],
                                    strain=[("WB:WBStrain00043982", "M9")],
                                    species=[("NCBITaxon:10090", "Mus musculus"),
                                             ("NCBITaxon:6239", "Caenorhabditis elegans")]), EXCLUSIONS)
    assert values["genes"] == ["00000002;%;unc-119"]
    assert values["strains"] == []
    assert values["species"] == ["Caenorhabditis elegans"]


def test_duplicate_entity_ids_are_merged():
    values = to_tfp_values(entities(gene=[("WB:WBGene00002974", "lev-1"), ("WB:WBGene00002974", "unc-63x"),
                                          ("WB:WBGene00002974", "lev-1")]), EXCLUSIONS)
    assert values["genes"] == ["00002974;%;lev-1"]


def test_missing_name_falls_back_to_the_id():
    values = to_tfp_values(entities(allele=[("WB:WBVar00088809", None)]), EXCLUSIONS)
    assert values["alleles"] == ["WBVar00088809;%;WBVar00088809"]


def test_name_equal_to_the_curie_is_treated_as_missing():
    # the ABC returns the curie itself as entity_name when it cannot resolve the name
    values = to_tfp_values(entities(gene=[("WB:WBGene00002974", "WB:WBGene00002974")],
                                    strain=[("WB:WBStrain00043982", "WB:WBStrain00043982")]), EXCLUSIONS)
    assert values["genes"] == ["00002974;%;WBGene00002974"]
    assert values["strains"] == ["WBStrain00043982;%;WBStrain00043982"]


def test_species_without_a_real_name_is_dropped():
    values = to_tfp_values(entities(species=[("NCBITaxon:6239", "NCBITaxon:6239"), ("NCBITaxon:7227", None),
                                             ("NCBITaxon:6238", "Caenorhabditis briggsae")]), EXCLUSIONS)
    assert values["species"] == ["Caenorhabditis briggsae"]


def test_values_are_sorted_by_name():
    values = to_tfp_values(entities(gene=[("WB:WBGene00000009", "zyg-1"), ("WB:WBGene00000001", "aak-2")]),
                           EXCLUSIONS)
    assert values["genes"] == ["00000001;%;aak-2", "00000009;%;zyg-1"]


def test_empty_entities_give_empty_lists():
    assert to_tfp_values(entities(), EXCLUSIONS) == {"genes": [], "alleles": [], "strains": [], "transgenes": [],
                                                     "species": []}


def test_kept_entities_keep_curie_and_name_by_type():
    kept = kept_entities(entities(gene=[("WB:WBGene00000009", "zyg-1"), ("WB:WBGene00000001", "aak-2"),
                                        ("WB:WBGene00000003", "run")],
                                  species=[("NCBITaxon:6239", "Caenorhabditis elegans"),
                                           ("NCBITaxon:7227", "NCBITaxon:7227")]), EXCLUSIONS)
    assert kept["gene"] == [("WB:WBGene00000001", "aak-2"), ("WB:WBGene00000009", "zyg-1")]
    assert kept["species"] == [("NCBITaxon:6239", "Caenorhabditis elegans")]
    assert kept["allele"] == []


def test_kept_entities_use_the_id_for_missing_names():
    kept = kept_entities(entities(strain=[("WB:WBStrain00043982", "WB:WBStrain00043982")]), EXCLUSIONS)
    assert kept["strain"] == [("WB:WBStrain00043982", "WBStrain00043982")]


def test_config():
    config = load_config_from_file()
    assert config["abc_classifications"]["datatype_topics"] == {
        "otherexpr": "ATP:0000041", "catalyticact": "ATP:0000061", "geneint": "ATP:0000068",
        "geneprod": "ATP:0000069", "genereg": "ATP:0000070", "rnai": "ATP:0000082", "newmutant": "ATP:0000083",
        "overexpr": "ATP:0000084"}
    assert config["abc_classifications"]["precheck_levels"] == ["HIGH", "MEDIUM"]
    assert config["ack_pipeline_tags"] == {"tag_source_id": 159, "created_by": "ACKnowledge_pipeline"}
    entity_extraction = config["abc_paper_selection"]["required_workflow_tags"]["entity_extraction"]
    assert "ATP:0000398" in entity_extraction
    assert "ATP:0000215" not in entity_extraction
    assert "abc_entities" not in config


DATATYPE_TOPICS = {"otherexpr": "ATP:0000041", "rnai": "ATP:0000082", "geneint": "ATP:0000068",
                   "geneprod": "ATP:0000069"}


def ack_classified(levels):
    tags = empty_paper_tags()
    for topic, level in levels.items():
        tags["classifications"]["ACKnowledge_pipeline"][topic] = {
            "negated": level in ("LOW", "NEG"), "confidence_level": level, "confidence_score": 0.5,
            "data_novelty": "ATP:0000335", "data_context": "ATP:0000323", "ml_model_version": None, "date_created": ""}
    return tags


def test_ack_pipeline_levels():
    tags = ack_classified({"ATP:0000082": "HIGH", "ATP:0000041": "LOW", "ATP:0000068": "MEDIUM",
                           "ATP:0000069": None})
    # the ACKnowledge_pipeline tag is negated for LOW: what the author saw was "not pre-checked"
    assert ack_pipeline_levels(tags, DATATYPE_TOPICS) == {"rnai": "HIGH", "otherexpr": "NEG", "geneint": "MEDIUM",
                                                          "geneprod": "MEDIUM"}


def test_classifier_tags_are_not_read():
    tags = empty_paper_tags()
    tags["classifications"]["abc_document_classifier"]["ATP:0000082"] = {
        "negated": False, "confidence_level": "HIGH", "confidence_score": 0.9, "data_novelty": None,
        "data_context": None, "ml_model_version": 2, "date_created": ""}
    assert ack_pipeline_levels(tags, DATATYPE_TOPICS) == {}


def test_ack_pipeline_tfp_strings():
    tags = empty_paper_tags()
    tags["has_ack_pipeline_entity_tags"] = True
    tags["entities"]["ACKnowledge_pipeline"]["gene"] = [("WB:WBGene00002974", "lev-1"), ("WB:WBGene00000003", "run")]
    tags["entities"]["ACKnowledge_pipeline"]["species"] = [("NCBITaxon:6239", "Caenorhabditis elegans")]
    tags["entities"]["abc_entity_extractor"]["gene"] = [("WB:WBGene00000009", "zyg-1")]
    # no exclusion lists at read time: the pipeline applied them when it wrote the tags
    assert ack_pipeline_tfp_strings(tags) == {"genestudied": "00002974;%;lev-1 | 00000003;%;run", "variation": "",
                                              "strain": "", "transgene": "", "species": "Caenorhabditis elegans"}


def test_no_ack_pipeline_entity_tags_gives_none():
    tags = empty_paper_tags()
    tags["entities"]["abc_entity_extractor"]["gene"] = [("WB:WBGene00000009", "zyg-1")]
    assert ack_pipeline_tfp_strings(tags) is None


def test_ack_pipeline_tags_for_a_wb_paper():
    tags = empty_paper_tags()
    with mock.patch("src.backend.common.abc_paper_data.get_abc_curie", return_value="AGRKB:1") as curie, \
            mock.patch("src.backend.common.abc_paper_data.get_abc_paper_tags",
                       return_value={"AGRKB:1": tags}) as abc:
        assert get_ack_pipeline_tags("00000001") is tags
    curie.assert_called_once_with("00000001", timeout=30)
    abc.assert_called_once_with(["AGRKB:1"], timeout=30)


def test_paper_not_in_the_abc_gives_none():
    with mock.patch("src.backend.common.abc_paper_data.get_abc_curie", return_value=None), \
            mock.patch("src.backend.common.abc_paper_data.get_abc_paper_tags") as abc:
        assert get_ack_pipeline_tags("00000001") is None
    abc.assert_not_called()


def test_any_abc_failure_gives_none():
    for error in (ABCRequestError("down"), RuntimeError("no Cognito credentials")):
        with mock.patch("src.backend.common.abc_paper_data.get_abc_curie", side_effect=error):
            assert get_ack_pipeline_tags("00000001") is None


def test_non_numeric_paper_ids_never_reach_the_abc():
    # the id goes into an ABC URL fetched with the admin token
    for bad in ("1/../../reference/1", "00000001?x=1", "", None, "WBPaper00000001"):
        with mock.patch("src.backend.common.abc_paper_data.get_abc_curie") as curie:
            assert get_ack_pipeline_tags(bad) is None
        curie.assert_not_called()
