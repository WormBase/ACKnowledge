from types import SimpleNamespace
from unittest import mock

import pytest

from wbtools.literature.paper import ABCRequestError

from src.backend.pipeline.abc_entities import get_tfp_values_for_papers, to_tfp_values

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


def paper(paper_id, curie):
    return SimpleNamespace(paper_id=paper_id, agr_curie=curie)


def test_values_for_papers_come_from_one_abc_call():
    found = {"AGRKB:1": entities(gene=[("WB:WBGene00002974", "lev-1")]), "AGRKB:2": entities()}
    with mock.patch("src.backend.pipeline.abc_entities.get_abc_extracted_entities", return_value=found) as abc:
        values = get_tfp_values_for_papers([paper("00000001", "AGRKB:1"), paper("00000002", "AGRKB:2")], EXCLUSIONS)
    abc.assert_called_once_with(["AGRKB:1", "AGRKB:2"])
    assert values["00000001"]["genes"] == ["00002974;%;lev-1"]
    assert values["00000002"]["genes"] == []


def test_no_papers_makes_no_abc_call():
    with mock.patch("src.backend.pipeline.abc_entities.get_abc_extracted_entities") as abc:
        assert get_tfp_values_for_papers([], EXCLUSIONS) == {}
    abc.assert_not_called()


def test_abc_errors_propagate():
    with mock.patch("src.backend.pipeline.abc_entities.get_abc_extracted_entities",
                    side_effect=ABCRequestError("down")):
        with pytest.raises(ABCRequestError):
            get_tfp_values_for_papers([paper("00000001", "AGRKB:1")], EXCLUSIONS)
