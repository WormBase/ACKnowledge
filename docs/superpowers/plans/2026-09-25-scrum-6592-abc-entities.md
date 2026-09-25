# SCRUM-6592 ABC Entities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The ACKnowledge pipeline pre-populates genes, alleles, strains, transgenes and species from ABC's `abc_entity_extractor` topic entity tags, instead of extracting them from the paper text.

**Architecture:**
- wbtools 3.6.0 adds `wbtools/literature/abc_entities.py`, which fetches the tags in batches.
- ACKnowledge adds `src/backend/pipeline/abc_entities.py`, which converts them to the existing `tfp_*` formats and applies the `config.yml` exclusion lists.
- `process_papers.py` stops loading text and drops NttExtractor, Textpresso and the WB curated lists.

**Tech Stack:** Python 3.8, requests, pytest 7, unittest.mock.

**Spec:** `docs/superpowers/specs/2026-09-25-scrum-6592-abc-entities-design.md` (ACKnowledge repo, branch `SCRUM-6592`).

## Global Constraints

- Python 3.8: no `X | None` and no builtin generics in annotations (use `typing`). PEP8, lines under 120 characters, no trailing whitespace.
- wbtools version `3.6.0`. ACKnowledge pin `wbtools==3.6.0`.
- Source is only `abc_entity_extractor`. Topics: gene ATP:0000005, allele ATP:0000285 (and ATP:0000006), strain ATP:0000027, transgenic allele ATP:0000110, species ATP:0000123.
- WB entities only. Prefixes: `WB:WBGene`, `WB:WBVar`, `WB:WBStrain`, `WB:WBTransgene`, and `NCBITaxon:` for species.
- `tfp_*` formats:
  - genes `00002974;%;lev-1`;
  - alleles, strains and transgenes `WBVar…;%;name` / `WBStrain…;%;name` / `WBTransgene…;%;name`;
  - species: the name only.
- Exclusion lists come from `config["ntt_extraction"]["exclusion_list"]`: by name for gene, strain, allele and transgene; by taxon id for species. The `ntt_extraction` section stays unchanged (the SGD script uses it).
- ABC failures raise `wbtools.literature.paper.ABCRequestError` and stop the run.
- Import cutoff `2026-09-25`, stored in `config.yml` as `abc_entities.import_cutoff`.
- Commits: never `git add` or `git commit` until the user says so (user CLAUDE.md). Commit checkpoints are at the end of each repo's tasks.
- Tests:
  - wbtools: `python -m pytest tests/literature -q -p no:warnings` in `/home/valerio/workspace/caltech/wbtools`;
  - ACKnowledge: `python -m pytest src/backend/pipeline -q -p no:warnings` in `/home/valerio/workspace/caltech/acknowledge`;
  - both use the `acknowledge` conda env (wbtools is an editable install).

## Review Focus

1. **A negated tag that still carries an entity** ("this gene is NOT in the paper"). Expected: never pre-populated. *Pinned by `test_negated_entity_tags_are_skipped` (Task 1).*
2. **A tag from a different source** coming back despite the source filter. Expected: ignored. *Pinned by `test_other_sources_are_ignored` (Task 1).*
3. **The same entity tagged twice with different names** (e.g. a synonym and the public name). Expected: one value, the first name seen. *Pinned by `test_duplicate_entity_ids_are_merged` (Task 2).*
4. **An empty selection** (no papers today). Expected: no ABC call, empty result. *Pinned by `test_no_papers_makes_no_abc_call` (Task 2).*
5. **A species tag with the right taxon but no `NCBITaxon:` prefix, or a gene from another MOD.** Expected: dropped, never written to `tfp_*`. *Pinned by `test_non_wb_entities_are_dropped` (Task 1).*

---

## wbtools (`/home/valerio/workspace/caltech/wbtools`)

### Task 0: Branch

- [ ] **Step 1:**

```bash
cd /home/valerio/workspace/caltech/wbtools
git checkout main && git pull --ff-only && git checkout -b SCRUM-6592
```

Expected: `Switched to a new branch 'SCRUM-6592'`, from `main` at `4af0779` (3.5.1).

### Task 1: `get_abc_extracted_entities`

**Files:**
- Create: `wbtools/literature/abc_entities.py`
- Test: `tests/literature/test_abc_entities.py`

**Interfaces:**
- Consumes: `ABC_API`, `ABCRequestError` and `DEFAULT_REQUEST_TIMEOUT` from `wbtools.literature.paper`; `get_authentication_token` and `generate_headers` from `wbtools.utils.auth_utils`.
- Produces: `get_abc_extracted_entities(agr_curies: List[str]) -> Dict[str, Dict[str, List[Tuple[str, str]]]]`. Every input curie maps to `{"gene": [...], "allele": [...], "strain": [...], "transgene": [...], "species": [...]}`, where each list holds `(entity_curie, entity_name)`. Raises `ABCRequestError`.

- [ ] **Step 1: Write the failing tests** in `tests/literature/test_abc_entities.py`

```python
import unittest
from unittest import mock

import requests

from wbtools.literature.abc_entities import get_abc_extracted_entities, BATCH_SIZE
from wbtools.literature.paper import ABCRequestError


def tag(topic, entity=None, name=None, negated=False, source="abc_entity_extractor"):
    return {"topic": topic, "entity": entity, "entity_name": name, "negated": negated,
            "tag_source": {"source_method": source}}


def response(json_body, status=200):
    resp = mock.Mock()
    resp.json.return_value = json_body
    if status >= 400:
        resp.raise_for_status.side_effect = requests.exceptions.HTTPError(f"{status} error")
    else:
        resp.raise_for_status.return_value = None
    return resp


@mock.patch("wbtools.literature.abc_entities.generate_headers", return_value={})
@mock.patch("wbtools.literature.abc_entities.get_authentication_token", return_value="token")
class TestGetAbcExtractedEntities(unittest.TestCase):

    def fetch(self, tags_by_curie, curies=("AGRKB:1",)):
        with mock.patch("wbtools.literature.abc_entities.requests.post",
                        return_value=response({"tags": tags_by_curie})) as post:
            result = get_abc_extracted_entities(list(curies))
        return result, post

    def test_request_filters_on_extractor_source_and_entity_topics(self, *_):
        _, post = self.fetch({"AGRKB:1": []})
        self.assertTrue(post.call_args[0][0].endswith("/topic_entity_tag/by_references"))
        body = post.call_args[1]["json"]
        self.assertEqual(body["curies_or_reference_ids"], ["AGRKB:1"])
        self.assertEqual(body["filters"]["source_methods"], ["abc_entity_extractor"])
        self.assertEqual(set(body["filters"]["topics"]),
                         {"ATP:0000005", "ATP:0000285", "ATP:0000006", "ATP:0000027", "ATP:0000110", "ATP:0000123"})

    def test_entities_are_grouped_by_type(self, *_):
        result, _ = self.fetch({"AGRKB:1": [
            tag("ATP:0000005", "WB:WBGene00002974", "lev-1"),
            tag("ATP:0000285", "WB:WBVar00088809", "md176"),
            tag("ATP:0000006", "WB:WBVar00089452", "n363"),
            tag("ATP:0000027", "WB:WBStrain00043982", "N2"),
            tag("ATP:0000110", "WB:WBTransgene00016465", "leEx2996"),
            tag("ATP:0000123", "NCBITaxon:6239", "Caenorhabditis elegans")]})
        self.assertEqual(result["AGRKB:1"], {
            "gene": [("WB:WBGene00002974", "lev-1")],
            "allele": [("WB:WBVar00088809", "md176"), ("WB:WBVar00089452", "n363")],
            "strain": [("WB:WBStrain00043982", "N2")],
            "transgene": [("WB:WBTransgene00016465", "leEx2996")],
            "species": [("NCBITaxon:6239", "Caenorhabditis elegans")]})

    def test_negated_entity_tags_are_skipped(self, *_):
        result, _ = self.fetch({"AGRKB:1": [tag("ATP:0000005", "WB:WBGene00002974", "lev-1", negated=True),
                                            tag("ATP:0000110", negated=True)]})
        self.assertEqual(result["AGRKB:1"]["gene"], [])
        self.assertEqual(result["AGRKB:1"]["transgene"], [])

    def test_other_sources_are_ignored(self, *_):
        result, _ = self.fetch({"AGRKB:1": [tag("ATP:0000005", "WB:WBGene00001", "a-1", source="ACKnowledge_form"),
                                            tag("ATP:0000005", "WB:WBGene00002", "b-2")]})
        self.assertEqual(result["AGRKB:1"]["gene"], [("WB:WBGene00002", "b-2")])

    def test_non_wb_entities_are_dropped(self, *_):
        result, _ = self.fetch({"AGRKB:1": [tag("ATP:0000005", "FB:FBgn0028430", "He"),
                                            tag("ATP:0000123", "6239", "Caenorhabditis elegans"),
                                            tag("ATP:0000123", "NCBITaxon:10090", "Mus musculus")]})
        self.assertEqual(result["AGRKB:1"]["gene"], [])
        self.assertEqual(result["AGRKB:1"]["species"], [("NCBITaxon:10090", "Mus musculus")])

    def test_papers_missing_from_the_response_are_empty(self, *_):
        result, _ = self.fetch({}, curies=("AGRKB:1",))
        self.assertEqual(result["AGRKB:1"],
                         {"gene": [], "allele": [], "strain": [], "transgene": [], "species": []})

    def test_curies_are_requested_in_batches(self, *_):
        curies = [f"AGRKB:{i}" for i in range(BATCH_SIZE + 5)]
        with mock.patch("wbtools.literature.abc_entities.requests.post",
                        return_value=response({"tags": {}})) as post:
            result = get_abc_extracted_entities(curies)
        self.assertEqual([len(c[1]["json"]["curies_or_reference_ids"]) for c in post.call_args_list],
                         [BATCH_SIZE, 5])
        self.assertEqual(len(result), BATCH_SIZE + 5)

    def test_http_error_raises(self, *_):
        with mock.patch("wbtools.literature.abc_entities.requests.post", return_value=response({}, status=500)):
            with self.assertRaises(ABCRequestError):
                get_abc_extracted_entities(["AGRKB:1"])

    def test_connection_error_raises(self, *_):
        with mock.patch("wbtools.literature.abc_entities.requests.post",
                        side_effect=requests.exceptions.ConnectionError("down")):
            with self.assertRaises(ABCRequestError):
                get_abc_extracted_entities(["AGRKB:1"])

    def test_response_without_tags_raises(self, *_):
        with mock.patch("wbtools.literature.abc_entities.requests.post",
                        return_value=response({"error": "boom"})):
            with self.assertRaises(ABCRequestError):
                get_abc_extracted_entities(["AGRKB:1"])


if __name__ == '__main__':
    unittest.main()
```

- [ ] **Step 2: Run to verify they fail**

Run: `python -m pytest tests/literature/test_abc_entities.py -q -p no:warnings`
Expected: collection ERROR, `ModuleNotFoundError: No module named 'wbtools.literature.abc_entities'`.

- [ ] **Step 3: Implement** `wbtools/literature/abc_entities.py`

```python
import logging
from typing import Dict, List, Tuple

import requests

from wbtools.literature.paper import ABC_API, ABCRequestError, DEFAULT_REQUEST_TIMEOUT
from wbtools.utils.auth_utils import get_authentication_token, generate_headers

logger = logging.getLogger(__name__)

ENTITY_EXTRACTOR_SOURCE_METHOD = "abc_entity_extractor"
BATCH_SIZE = 100
ENTITY_TYPES = ("gene", "allele", "strain", "transgene", "species")
TOPIC_ENTITY_TYPES = {
    "ATP:0000005": "gene",
    "ATP:0000285": "allele",  # classical allele, the topic the WB extractor reports alleles with
    "ATP:0000006": "allele",
    "ATP:0000027": "strain",
    "ATP:0000110": "transgene",  # transgenic allele
    "ATP:0000123": "species",
}
# WB entities only: other MODs' entities matched in a WB paper are not pre-populated
ENTITY_PREFIXES = {"gene": "WB:WBGene", "allele": "WB:WBVar", "strain": "WB:WBStrain",
                   "transgene": "WB:WBTransgene", "species": "NCBITaxon:"}


def get_abc_extracted_entities(agr_curies: List[str]) -> Dict[str, Dict[str, List[Tuple[str, str]]]]:
    """get the entities extracted by the ABC entity extractor for the given references

    Args:
        agr_curies (List[str]): AGRKB curies of the references

    Returns:
        Dict[str, Dict[str, List[Tuple[str, str]]]]: for each curie, the (entity curie, entity name) pairs by entity
                                                    type (gene, allele, strain, transgene, species)

    Raises:
        ABCRequestError: if the ABC request fails
    """
    entities = {curie: {entity_type: [] for entity_type in ENTITY_TYPES} for curie in agr_curies}
    for start in range(0, len(agr_curies), BATCH_SIZE):
        batch = agr_curies[start:start + BATCH_SIZE]
        tags_by_curie = _get_entity_tags(batch)
        for curie in batch:
            tags = tags_by_curie.get(curie) or []
            if not tags:
                logger.warning(f"No entity extraction tags in ABC for {curie}")
            for tag in tags:
                entity_type = TOPIC_ENTITY_TYPES.get(tag.get("topic"))
                entity = tag.get("entity")
                source_method = (tag.get("tag_source") or {}).get("source_method")
                if entity_type is None or not entity or tag.get("negated") or \
                        source_method != ENTITY_EXTRACTOR_SOURCE_METHOD:
                    continue
                if entity.startswith(ENTITY_PREFIXES[entity_type]):
                    entities[curie][entity_type].append((entity, tag.get("entity_name")))
    return entities


def _get_entity_tags(agr_curies: List[str]) -> dict:
    headers = generate_headers(get_authentication_token())
    body = {"curies_or_reference_ids": agr_curies,
            "filters": {"source_methods": [ENTITY_EXTRACTOR_SOURCE_METHOD], "topics": list(TOPIC_ENTITY_TYPES)}}
    try:
        response = requests.post(f"https://{ABC_API}/topic_entity_tag/by_references", json=body, headers=headers,
                                 timeout=DEFAULT_REQUEST_TIMEOUT)
        response.raise_for_status()
        result = response.json()
    except (requests.exceptions.RequestException, ValueError) as e:
        raise ABCRequestError(f"ABC topic entity tag request failed: {e}") from e
    if not isinstance(result, dict) or not isinstance(result.get("tags"), dict):
        raise ABCRequestError(f"ABC topic entity tag request failed: {result}")
    return result["tags"]
```

- [ ] **Step 4: Run to verify they pass**

Run: `python -m pytest tests/literature/test_abc_entities.py -q -p no:warnings`
Expected: `10 passed`.

### Task 2: wbtools version and commit checkpoint

- [ ] **Step 1:** Set `version = "3.6.0"` in `pyproject.toml`. Then run `python -m pytest tests/literature/test_abc_entities.py tests/literature/test_abc_search.py tests/literature/test_paper_abc_markdown.py tests/literature/test_paper_abc_emails.py -q -p no:warnings` and expect 0 failed. Lint the new files with `~/anaconda3/envs/agr_automated_information_extraction/bin/flake8 --max-line-length 120 wbtools/literature/abc_entities.py tests/literature/test_abc_entities.py`; expect clean.
- [ ] **Step 2:** Once the user says to commit: `git add wbtools/literature/abc_entities.py tests/literature/test_abc_entities.py pyproject.toml` and commit `feat(literature): get the entities extracted by the ABC for references (SCRUM-6592)`, with the attribution line. Do not add `dist/` or `wbtools.egg-info/`.

---

## ACKnowledge (`/home/valerio/workspace/caltech/acknowledge`, branch `SCRUM-6592`)

### Task 3: Convert ABC entities to `tfp_*` values

**Files:**
- Create: `src/backend/pipeline/abc_entities.py`
- Test: `src/backend/pipeline/test_abc_entities.py`

**Interfaces:**
- Consumes: `get_abc_extracted_entities` (Task 1).
- Produces:
  - `to_tfp_values(entities: Dict[str, List[Tuple[str, str]]], exclusion_lists: Dict[str, List[str]]) -> Dict[str, List[str]]`, with keys `genes`, `alleles`, `strains`, `transgenes`, `species`;
  - `get_tfp_values_for_papers(papers, exclusion_lists) -> Dict[str, Dict[str, List[str]]]`, keyed by `paper.paper_id`.

- [ ] **Step 1: Write the failing tests** in `src/backend/pipeline/test_abc_entities.py`

```python
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `python -m pytest src/backend/pipeline/test_abc_entities.py -q -p no:warnings`
Expected: collection ERROR, `ModuleNotFoundError: No module named 'src.backend.pipeline.abc_entities'`.

- [ ] **Step 3: Implement** `src/backend/pipeline/abc_entities.py`

```python
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
            if not name:
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
```

- [ ] **Step 4: Run to verify they pass**

Run: `python -m pytest src/backend/pipeline/test_abc_entities.py -q -p no:warnings`
Expected: `9 passed`.

### Task 4: Wire into the pipeline, stop loading text, config and crontab

**Files:**
- Modify: `src/backend/pipeline/abc_paper_selection.py` (the `load_from_wb_database` call)
- Modify: `src/backend/pipeline/test_abc_paper_selection.py` (`test_batches_are_loaded_with_the_abc_filters`)
- Modify: `src/backend/pipeline/process_papers.py` (whole file, shown below)
- Modify: `src/backend/pipeline/crontab` (the `process_papers.py` line)
- Modify: `src/backend/config.yml` (append `abc_entities`)
- Modify: `requirements.txt` (the `wbtools==` pin, in Task 8)

**Interfaces:**
- Consumes: `get_tfp_values_for_papers` (Task 3).

- [ ] **Step 1: Update the selection test first.** In `test_batches_are_loaded_with_the_abc_filters`, the expected call becomes:

```python
    assert cm.calls == [{"paper_ids": ["00000001", "00000002", "00000003"], "max_num_papers": 5,
                         "agr_curies": {"00000001": "AGRKB:1", "00000002": "AGRKB:2", "00000003": "AGRKB:3"},
                         "load_pdf_files": False, "must_be_autclass_flagged": False,
                         "exclude_afp_processed": True, "exclude_afp_not_curatable": True,
                         "exclude_no_author_email": True}]
```

Run: `python -m pytest src/backend/pipeline/test_abc_paper_selection.py -q -p no:warnings`. Expected: 1 failed (the call still has `text_source` and the text filters).

- [ ] **Step 2: Change the call** in `abc_paper_selection.py` to:

```python
        corpus_manager.load_from_wb_database(
            db_name, db_user, db_password, db_host, paper_ids=[wb_paper_id for wb_paper_id, _ in batch],
            max_num_papers=num_papers, agr_curies=dict(batch), load_pdf_files=False,
            must_be_autclass_flagged=False, exclude_afp_processed=True, exclude_afp_not_curatable=True,
            exclude_no_author_email=True)
```

Also update the docstring. The paper text is no longer loaded, because the entities come from the ABC. Rerun: expected `7 passed`.

- [ ] **Step 3: Rewrite `process_papers.py`.** Everything from the `main()` argument parser to the end of the email loop is kept. The changes:
  - imports: remove `time`, `EntityType`, `NttExtractor`, `TextpressoLiteratureIndex` and `ObsoleteStrainsFilter`; add `from src.backend.pipeline.abc_entities import get_tfp_values_for_papers`;
  - delete `retry_with_backoff` and `extract_meaningful_entities_with_retry`;
  - delete the `-t/--textpresso-token` argument, the `ntt_extractor` and `textpresso_lit_index` construction, and the whole "getting lists of entities" block (curated lists, name-id maps, obsolete strains, taxon map);
  - the `--paper-ids` load becomes:

```python
        cm.load_from_wb_database(
            args.db_name, args.db_user, args.db_password, args.db_host, paper_ids=args.paper_ids,
            load_pdf_files=False, must_be_autclass_flagged=False, exclude_no_author_email=True)
```

  - after loading, before `tinyurls = []`:

```python
    logger.info(f"Entities are taken from the ABC entity extractor: ACKnowledge-extracted entities must not be "
                f"imported into the ABC after {config['abc_entities']['import_cutoff']} (SCRUM-6592)")
    tfp_values = get_tfp_values_for_papers(cm.get_all_papers(), config["ntt_extraction"]["exclusion_list"])
```

  - in the paper loop, everything from `fulltext = ...` through the `strains_id_name = ...` block is replaced by:

```python
            paper.title = paper.title if paper.title else ""
            values = tfp_values[paper.paper_id]
            genes_id_name = values["genes"]
            alleles_id_name = values["alleles"]
            strains_id_name = values["strains"]
            transgenes_id_name = values["transgenes"]
            species = values["species"]
```

  - `save_extracted_data_to_db(... species=species ...)` replaces `species=meaningful_species`, and the email condition becomes `if genes_id_name or alleles_id_name or transgenes_id_name or strains_id_name:` (it used `meaningful_strains`).

- [ ] **Step 4: `crontab`:** remove ` -t $TEXTPRESSO_TOKEN` from the `process_papers.py` line (line 4). **`config.yml`:** append at top level:

```yaml

abc_entities:
  # SCRUM-6592: from this date the pipeline pre-populates entities from the ABC entity extractor. tfp_* values
  # dated on or after it come from the ABC and must not be imported into the ABC as ACKnowledge_pipeline tags.
  import_cutoff: 2026-09-25
```

- [ ] **Step 5: Verify**

Run:
- `python -m py_compile src/backend/pipeline/process_papers.py`
- `grep -nE "ntt_extractor|textpresso|meaningful_|NttExtractor|ObsoleteStrains|EntityType|retry_with_backoff" src/backend/pipeline/process_papers.py`
- `python -m pytest src/backend/pipeline -q -p no:warnings`

Expected: it compiles; the grep prints nothing; `36 passed` (27 existing + 9 new).

Also run `~/anaconda3/envs/agr_automated_information_extraction/bin/flake8 --max-line-length 120 --select F src/backend/pipeline/process_papers.py`. Expected: only the existing `F403`/`F405` star-import warnings from `emailtools import *`, and no `F401`/`F821`/`F841`.

---

## Verification and release

### Task 5: Production comparison (read-only)

- [ ] **Step 1:** Take the 30 most recent WB papers processed by ACKnowledge in production. Use `tfp_genestudied` rows with `tfp_timestamp` < 2026-09-25, ordered by timestamp desc, via `ssh caltech-curation` and `psql` on `caltech-curation-services-main-db-1`, read-only. For each:
  - read its `tfp_genestudied`, `tfp_variation`, `tfp_strain`, `tfp_transgene` and `tfp_species`;
  - resolve its curie from ABC (`/reference/by_cross_reference/WB:WBPaper<id>`);
  - compute `to_tfp_values(get_abc_extracted_entities([curie])[curie], exclusion_lists)` with the wbtools `.env` credentials.

  Report per type: papers compared, values in both, ABC-only and ACKnowledge-only (totals and a few examples).
- [ ] **Step 2:** Post the table as a comment on SCRUM-6592.

### Task 6: wbtools and ACKnowledge commits, push

- [ ] **Step 1:** Once the user says to commit, commit the ACKnowledge files: spec, plan, `abc_entities.py`, `test_abc_entities.py`, `abc_paper_selection.py`, `test_abc_paper_selection.py`, `process_papers.py`, `crontab` and `config.yml`. Message: `feat(pipeline): pre-populate entities from the ABC entity extractor (SCRUM-6592)`. Push both `SCRUM-6592` branches.

### Task 7: End-to-end on caltech-curation-dev

- [ ] **Step 1:** On the dev server, build a throwaway image from the ACKnowledge `SCRUM-6592` branch, with `ATP:0000215` removed from `config.yml`. Run it as a detached container named `scrum6592_e2e`:
  - install wbtools from `https://github.com/WormBase/wbtools/archive/refs/heads/SCRUM-6592.zip`;
  - run `process_papers.py -L INFO -n 1 -d` with the dev API container's environment and no `-t`.
- [ ] **Step 2:** From `docker logs`, check:
  - `Entities from ABC for paper …` is present;
  - there is no `Started pdf`, no `Loading text from`, and no Textpresso request;
  - the run ends with `Pipeline finished successfully`.

  Compare the paper's dev `tfp_*` rows with its ABC tags. Ask the user to confirm the admin email arrived. Then remove the container and the image.

### Task 8: Release (after the user approves)

- [ ] **Step 1:** Fast-forward wbtools `SCRUM-6592` into `main` and push. Build in a scratch venv, `twine check`, then `twine upload -r wbtools` 3.6.0, and confirm with `pip download wbtools==3.6.0`.
- [ ] **Step 2:** In ACKnowledge: set `wbtools==3.6.0` in `requirements.txt`, commit, merge `SCRUM-6592` into `develop` and push. Check the Jenkins `acknowledge-dev` build, and that `afp_api_test` runs wbtools 3.6.0.
- [ ] **Step 3:** Comment on SCRUM-6592 with the results. Production stays on its current version until the user decides.
