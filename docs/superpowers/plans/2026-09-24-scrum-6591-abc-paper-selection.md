# SCRUM-6591 ABC Paper Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The ACKnowledge pipeline selects its papers from ABC search and reads their text from ABC Markdown files, so it no longer uses the WB database for candidate selection or GROBID for text.

**Architecture:**
- wbtools 3.5.0 adds three pieces:
  - an ABC search pager (`wbtools/literature/abc_search.py`);
  - a Markdown text loader on `WBPaper`;
  - a `text_source` switch on `CorpusManager.load_from_wb_database`.
- ACKnowledge adds a small selection module (`src/backend/pipeline/abc_paper_selection.py`) and a `config.yml` section, and wires both into `process_papers.py`.
- Entity extraction, emails and database writes are unchanged.

**Tech Stack:** Python 3.8, requests, `agr-abc-document-parsers` 1.7.2, pytest 7, unittest.mock.

**Spec:** `docs/superpowers/specs/2026-09-24-scrum-6591-abc-paper-selection-design.md` (ACKnowledge repo, branch `SCRUM-6591`).

## Global Constraints

- Python 3.8 (pipeline image `python:3.8-slim`, conda env `acknowledge`). Don't use syntax newer than 3.8, e.g. no `X | None`, no `list[str]` in annotations.
- PEP8, lines under 120 characters, no trailing whitespace. Match the surrounding style: lowercase docstrings in wbtools, f-string logging.
- The wbtools version becomes `3.5.0`. New dependency: `agr-abc-document-parsers>=1.7.2`.
- `CorpusManager.load_from_wb_database(text_source=...)` defaults to `"pdf"`, so other callers (e.g. the curator dashboard) behave exactly as before.
- Errors meaning "ABC is broken" raise `wbtools.literature.paper.ABCRequestError` and stop the run: a failed search, a failed email lookup, or a missing or broken main Markdown file. A failed supplement only logs a warning.
- Commits: per the user's CLAUDE.md, **never `git add` or `git commit` until the user explicitly says "commit"**. Each repo has one commit checkpoint task at the end.
- Branches are named after the ticket: `SCRUM-6591` in both repos. wbtools branches from `main`; ACKnowledge already has the branch (from `develop`).
- Tests: wbtools runs `python -m pytest tests/literature -q -p no:warnings` from `/home/valerio/workspace/caltech/wbtools`. ACKnowledge runs `python -m pytest src/backend/pipeline -q -p no:warnings` from `/home/valerio/workspace/caltech/acknowledge`. Both use the `acknowledge` conda env, which imports wbtools from the local checkout (editable install).
- Dev testing leaves out `ATP:0000215` (allele extraction complete) from the required tags until SCRUM-6596 is fixed. Production keeps it.

## Review Focus

1. **ABC search results shift while paging** (papers are created during a run). The same WBPaper can come back on two pages. Expected: each paper is loaded at most once per run. *Pinned by `test_duplicate_candidates_are_loaded_once` (Task 5).*
2. **A main Markdown file that parses to no sentences** (empty or broken conversion). Expected: `ABCRequestError`, never an "empty" paper that gets processed with no entities. *Pinned by `test_main_markdown_without_sentences_raises` (Task 2).*
3. **`is_obsolete` arrives as the string `'false'`/`'true'` or as a boolean**. Expected: an obsolete `WB:WBPaper` cross-reference is never used, whichever type it is. *Pinned by `test_obsolete_wb_xref_is_ignored_string_or_bool` (Task 1).*
4. **A supplement stored for another MOD only** (e.g. a ZFIN-scoped `converted_merged_supplement`). Expected: ignored, and it doesn't count as a failure. *Pinned by `test_supplements_of_other_mods_are_ignored` (Task 2).*
5. **`--num-papers` larger than the number of selectable papers**. Expected: the loop stops when the search runs out and the pipeline processes what it found. *Pinned by `test_stops_when_candidates_run_out` (Task 5).*

---

## wbtools (repo `/home/valerio/workspace/caltech/wbtools`)

### Task 0: Branch

- [ ] **Step 1: Create the branch from an up-to-date main**

```bash
cd /home/valerio/workspace/caltech/wbtools
git checkout main && git pull --ff-only
git checkout -b SCRUM-6591
python -m pip install "agr-abc-document-parsers==1.7.2"
```

Expected: `Switched to a new branch 'SCRUM-6591'`, and the pip install succeeds. `lxml` 5.2.1 is already in the env, which satisfies `>=4.9`.

### Task 1: ABC search pager

**Files:**
- Create: `wbtools/literature/abc_search.py`
- Test: `tests/literature/test_abc_search.py`

**Interfaces:**
- Consumes: `ABC_API` and `ABCRequestError` from `wbtools.literature.paper`; `get_authentication_token` and `generate_headers` from `wbtools.utils.auth_utils`.
- Produces: `get_wb_paper_ids_from_abc(required_workflow_tags: Dict[str, List[str]], date_created_from: str, date_created_to: str) -> Iterator[Tuple[str, str]]`. It yields `(wb_paper_id, agr_curie)`, e.g. `("00070170", "AGRKB:101000001311329")`. It raises `ABCRequestError`.

- [ ] **Step 1: Write the failing tests** in `tests/literature/test_abc_search.py`

```python
import unittest
from unittest import mock

import requests

from wbtools.literature.abc_search import get_wb_paper_ids_from_abc, SEARCH_PAGE_SIZE
from wbtools.literature.paper import ABCRequestError

REQUIRED_TAGS = {"file_workflow": ["ATP:0000163"], "email_extraction": ["ATP:0000355"]}


def hit(number, xrefs=None):
    curie = f"AGRKB:1010000000{number:05d}"
    if xrefs is None:
        xrefs = [{"curie": f"WB:WBPaper{number:08d}", "is_obsolete": "false"}]
    return {"curie": curie, "cross_references": xrefs}


def response(json_body, status=200):
    resp = mock.Mock()
    resp.status_code = status
    resp.json.return_value = json_body
    if status >= 400:
        resp.raise_for_status.side_effect = requests.exceptions.HTTPError(f"{status} error")
    else:
        resp.raise_for_status.return_value = None
    return resp


@mock.patch("wbtools.literature.abc_search.generate_headers", return_value={})
@mock.patch("wbtools.literature.abc_search.get_authentication_token", return_value="token")
class TestGetWbPaperIdsFromAbc(unittest.TestCase):

    def run_search(self, pages):
        with mock.patch("wbtools.literature.abc_search.requests.post",
                        side_effect=[response(page) for page in pages]) as post:
            results = list(get_wb_paper_ids_from_abc(REQUIRED_TAGS, "2024-09-24", "2026-09-24"))
        return results, post

    def test_request_body(self, *_):
        _, post = self.run_search([{"hits": [hit(1)], "return_count": 1}])
        self.assertTrue(post.call_args[0][0].endswith("/search/references/"))
        body = post.call_args[1]["json"]
        self.assertEqual(body["facets_values"], {"mods_in_corpus.keyword": ["WB"], **REQUIRED_TAGS})
        self.assertEqual(body["date_created"], ["2024-09-24", "2026-09-24"])
        self.assertEqual(body["sort"], [{"date_created": {"order": "desc"}}])
        self.assertEqual(body["size_result_count"], SEARCH_PAGE_SIZE)
        self.assertEqual(body["page"], 1)

    def test_required_tags_are_not_modified(self, *_):
        tags = {"file_workflow": ["ATP:0000163"]}
        with mock.patch("wbtools.literature.abc_search.requests.post", return_value=response({"hits": []})):
            list(get_wb_paper_ids_from_abc(tags, "2024-09-24", "2026-09-24"))
        self.assertEqual(tags, {"file_workflow": ["ATP:0000163"]})

    def test_yields_wb_paper_id_and_curie(self, *_):
        results, _ = self.run_search([{"hits": [hit(70170)]}])
        self.assertEqual(results, [("00070170", "AGRKB:101000000070170")])

    def test_pages_until_a_short_page(self, *_):
        full_page = {"hits": [hit(i) for i in range(SEARCH_PAGE_SIZE)]}
        results, post = self.run_search([full_page, {"hits": [hit(500)]}])
        self.assertEqual(len(results), SEARCH_PAGE_SIZE + 1)
        self.assertEqual([c[1]["json"]["page"] for c in post.call_args_list], [1, 2])

    def test_stops_on_an_empty_page_after_a_full_one(self, *_):
        full_page = {"hits": [hit(i) for i in range(SEARCH_PAGE_SIZE)]}
        results, post = self.run_search([full_page, {"hits": []}])
        self.assertEqual(len(results), SEARCH_PAGE_SIZE)
        self.assertEqual(post.call_count, 2)

    def test_hit_without_wb_paper_xref_is_skipped(self, *_):
        results, _ = self.run_search([{"hits": [hit(1, xrefs=[{"curie": "PMID:123", "is_obsolete": "false"}]),
                                                hit(2)]}])
        self.assertEqual(results, [("00000002", "AGRKB:101000000000002")])

    def test_obsolete_wb_xref_is_ignored_string_or_bool(self, *_):
        results, _ = self.run_search([{"hits": [
            hit(1, xrefs=[{"curie": "WB:WBPaper00000001", "is_obsolete": "true"}]),
            hit(2, xrefs=[{"curie": "WB:WBPaper00000002", "is_obsolete": True}]),
            hit(3, xrefs=[{"curie": "WB:WBPaper00000099", "is_obsolete": "true"},
                          {"curie": "WB:WBPaper00000003", "is_obsolete": False}])]}])
        self.assertEqual(results, [("00000003", "AGRKB:101000000000003")])

    def test_http_error_raises(self, *_):
        with mock.patch("wbtools.literature.abc_search.requests.post", return_value=response({}, status=500)):
            with self.assertRaises(ABCRequestError):
                list(get_wb_paper_ids_from_abc(REQUIRED_TAGS, "2024-09-24", "2026-09-24"))

    def test_error_in_response_body_raises(self, *_):
        with mock.patch("wbtools.literature.abc_search.requests.post",
                        return_value=response({"error": "Elasticsearch unavailable"})):
            with self.assertRaises(ABCRequestError):
                list(get_wb_paper_ids_from_abc(REQUIRED_TAGS, "2024-09-24", "2026-09-24"))

    def test_connection_error_raises(self, *_):
        with mock.patch("wbtools.literature.abc_search.requests.post",
                        side_effect=requests.exceptions.ConnectionError("down")):
            with self.assertRaises(ABCRequestError):
                list(get_wb_paper_ids_from_abc(REQUIRED_TAGS, "2024-09-24", "2026-09-24"))


if __name__ == '__main__':
    unittest.main()
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tests/literature/test_abc_search.py -q -p no:warnings`
Expected: collection ERROR, `ModuleNotFoundError: No module named 'wbtools.literature.abc_search'`.

- [ ] **Step 3: Implement** `wbtools/literature/abc_search.py`

```python
import logging
from typing import Dict, Iterator, List, Tuple

import requests

from wbtools.literature.paper import ABC_API, ABCRequestError
from wbtools.utils.auth_utils import get_authentication_token, generate_headers

logger = logging.getLogger(__name__)

SEARCH_PAGE_SIZE = 100
WB_PAPER_XREF_PREFIX = "WB:WBPaper"


def get_wb_paper_ids_from_abc(required_workflow_tags: Dict[str, List[str]], date_created_from: str,
                              date_created_to: str) -> Iterator[Tuple[str, str]]:
    """get the WB papers in the ABC corpus created in the given window that have all the required workflow tags,
    newest first

    Args:
        required_workflow_tags (Dict[str, List[str]]): ABC search facet name (e.g. "file_workflow") -> ATP ids that
                                                       must all be present on the paper
        date_created_from (str): first creation date to include, YYYY-MM-DD
        date_created_to (str): last creation date to include, YYYY-MM-DD

    Returns:
        Iterator[Tuple[str, str]]: WBPaper id (without the WBPaper prefix) and AGRKB curie of each paper

    Raises:
        ABCRequestError: if the ABC search fails
    """
    facets_values = {"mods_in_corpus.keyword": ["WB"]}
    facets_values.update(required_workflow_tags)
    page = 1
    while True:
        hits = _search_references({"facets_values": facets_values,
                                   "date_created": [date_created_from, date_created_to],
                                   "sort": [{"date_created": {"order": "desc"}}],
                                   "size_result_count": SEARCH_PAGE_SIZE, "page": page})
        for hit in hits:
            wb_paper_id = _get_wb_paper_id(hit)
            if wb_paper_id is None:
                logger.warning(f"Skipping ABC reference {hit.get('curie')}: no WBPaper cross-reference")
                continue
            yield wb_paper_id, hit["curie"]
        if len(hits) < SEARCH_PAGE_SIZE:
            return
        page += 1


def _search_references(body: dict) -> list:
    headers = generate_headers(get_authentication_token())
    try:
        response = requests.post(f"https://{ABC_API}/search/references/", json=body, headers=headers, timeout=300)
        response.raise_for_status()
        result = response.json()
    except (requests.exceptions.RequestException, ValueError) as e:
        raise ABCRequestError(f"ABC search failed: {e}") from e
    if not isinstance(result, dict) or result.get("error") or "hits" not in result:
        raise ABCRequestError(f"ABC search failed: {result}")
    return result["hits"]


def _get_wb_paper_id(hit: dict):
    for xref in hit.get("cross_references") or []:
        if xref.get("curie", "").startswith(WB_PAPER_XREF_PREFIX) and \
                str(xref.get("is_obsolete")).lower() != "true":
            return xref["curie"][len(WB_PAPER_XREF_PREFIX):]
    return None
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tests/literature/test_abc_search.py -q -p no:warnings`
Expected: `10 passed`.

### Task 2: Markdown text loader on WBPaper

**Files:**
- Modify: `wbtools/literature/paper.py`: imports at the top; a new method after `load_text_from_pdf_files` (around line 199); module-level helpers after `get_data_from_url`.
- Modify: `pyproject.toml` (`dependencies`) and `requirements.txt`: add `agr-abc-document-parsers>=1.7.2`.
- Test: `tests/literature/test_paper_abc_markdown.py`

**Interfaces:**
- Consumes: `get_data_from_url(url, headers=None, file_type='json')`. It returns parsed JSON, or raw bytes when `file_type='pdf'`, or `None` on any error. Also `ABC_API`, `ABCRequestError`, `get_authentication_token`, `generate_headers`, and `read_markdown` / `extract_sentences` from `agr_abc_document_parsers`.
- Produces: `WBPaper.load_text_from_abc_markdown() -> bool`. It sets `self.main_text` (a list of sentences) and appends one sentence list per supplement to `self.supplemental_docs`, returns `True`, and raises `ABCRequestError`.

- [ ] **Step 1: Write the failing tests** in `tests/literature/test_paper_abc_markdown.py`

```python
import unittest
from unittest import mock

from wbtools.literature.paper import WBPaper, ABCRequestError

MAIN_MD = ("# Neuronal regulation of aging in C. elegans\n\n"
           "## Abstract\n\n"
           "We show that daf-16 controls lifespan. The effect needs neurons.\n\n"
           "## Results\n\n"
           "Mutants of unc-119 lived longer than wild type animals.\n")
SUPPLEMENT_MD = ("# Supplementary Information\n\n"
                 "## Supplementary methods\n\n"
                 "Worms were grown on NGM plates at 20 degrees.\n")


def ref_file(referencefile_id, file_class, file_extension="md", mods=(None,), display_name="file"):
    return {"referencefile_id": referencefile_id, "file_class": file_class, "file_extension": file_extension,
            "display_name": display_name,
            "referencefile_mods": [{"mod_abbreviation": mod} for mod in mods]}


class FakeAbc(object):
    """serves /show_all and /download_file responses the way get_data_from_url returns them"""

    def __init__(self, files, contents):
        self.files = files
        self.contents = contents

    def __call__(self, url, headers=None, file_type='json'):
        if "/referencefile/show_all/" in url:
            return self.files
        if "/referencefile/download_file/" in url:
            return self.contents.get(int(url.rsplit("/", 1)[1]))
        raise AssertionError(f"unexpected URL {url}")


@mock.patch("wbtools.literature.paper.generate_headers", return_value={})
@mock.patch("wbtools.literature.paper.get_authentication_token", return_value="token")
class TestLoadTextFromAbcMarkdown(unittest.TestCase):

    def load(self, files, contents):
        paper = WBPaper(paper_id="00068500", agr_curie="AGRKB:101000001193987")
        with mock.patch("wbtools.literature.paper.get_data_from_url", side_effect=FakeAbc(files, contents)):
            result = paper.load_text_from_abc_markdown()
        return paper, result

    def test_loads_main_and_wb_supplements_as_sentences(self, *_):
        paper, result = self.load(
            [ref_file(1, "main", "pdf", mods=("WB",)), ref_file(2, "converted_merged_main"),
             ref_file(3, "converted_merged_supplement", mods=("WB",))],
            {2: MAIN_MD.encode("utf-8"), 3: SUPPLEMENT_MD.encode("utf-8")})
        self.assertTrue(result)
        self.assertIsInstance(paper.main_text, list)
        self.assertIn("Mutants of unc-119 lived longer than wild type animals.", paper.main_text)
        self.assertEqual(len(paper.supplemental_docs), 1)
        self.assertIn("Worms were grown on NGM plates at 20 degrees.", paper.supplemental_docs[0])
        self.assertTrue(paper.has_main_text())
        self.assertIn("daf-16", paper.get_text_docs(include_supplemental=True, return_concatenated=True))

    def test_prefers_wb_or_shared_main_file(self, *_):
        paper, _ = self.load(
            [ref_file(2, "converted_merged_main", mods=("ZFIN",)), ref_file(4, "converted_merged_main", mods=("WB",))],
            {2: b"# Other\n\n## Results\n\nZebrafish text only here.\n", 4: MAIN_MD.encode("utf-8")})
        self.assertIn("Mutants of unc-119 lived longer than wild type animals.", paper.main_text)

    def test_falls_back_to_a_main_file_of_another_mod(self, *_):
        paper, _ = self.load([ref_file(2, "converted_merged_main", mods=("ZFIN",))], {2: MAIN_MD.encode("utf-8")})
        self.assertIn("Mutants of unc-119 lived longer than wild type animals.", paper.main_text)

    def test_supplements_of_other_mods_are_ignored(self, *_):
        paper, _ = self.load(
            [ref_file(2, "converted_merged_main"), ref_file(3, "converted_merged_supplement", mods=("ZFIN",))],
            {2: MAIN_MD.encode("utf-8"), 3: SUPPLEMENT_MD.encode("utf-8")})
        self.assertEqual(paper.supplemental_docs, [])

    def test_no_main_markdown_raises(self, *_):
        with self.assertRaises(ABCRequestError):
            self.load([ref_file(1, "main", "pdf", mods=("WB",))], {})

    def test_file_list_failure_raises(self, *_):
        paper = WBPaper(paper_id="00068500", agr_curie="AGRKB:101000001193987")
        with mock.patch("wbtools.literature.paper.get_data_from_url", return_value=None):
            with self.assertRaises(ABCRequestError):
                paper.load_text_from_abc_markdown()

    def test_main_download_failure_raises(self, *_):
        with self.assertRaises(ABCRequestError):
            self.load([ref_file(2, "converted_merged_main")], {2: None})

    def test_main_markdown_without_sentences_raises(self, *_):
        with self.assertRaises(ABCRequestError):
            self.load([ref_file(2, "converted_merged_main")], {2: b"\n\n   \n"})

    def test_supplement_failure_keeps_main_text(self, *_):
        paper, result = self.load(
            [ref_file(2, "converted_merged_main"), ref_file(3, "converted_merged_supplement", display_name="S1")],
            {2: MAIN_MD.encode("utf-8"), 3: None})
        self.assertTrue(result)
        self.assertTrue(paper.main_text)
        self.assertEqual(paper.supplemental_docs, [])

    def test_latin1_markdown_is_decoded(self, *_):
        paper, _ = self.load([ref_file(2, "converted_merged_main")],
                             {2: "# Title\n\n## Results\n\nThe prot\xe9ine is expressed in neurons.\n".encode("latin-1")})
        self.assertTrue(any("expressed in neurons" in sentence for sentence in paper.main_text))


if __name__ == '__main__':
    unittest.main()
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tests/literature/test_paper_abc_markdown.py -q -p no:warnings`
Expected: 10 failures, `AttributeError: 'WBPaper' object has no attribute 'load_text_from_abc_markdown'`.

- [ ] **Step 3: Implement** in `wbtools/literature/paper.py`

1. Add the import next to the other third-party imports (after `from grobid_client.types import TEI, File`):

```python
from agr_abc_document_parsers import extract_sentences, read_markdown
```

2. After `get_data_from_url` (before `class WBPaper`), add:

```python
MARKDOWN_MAIN_FILE_CLASS = "converted_merged_main"
MARKDOWN_SUPPLEMENT_FILE_CLASS = "converted_merged_supplement"


def _decode_markdown(content: bytes) -> str:
    try:
        return content.decode("utf-8")
    except UnicodeDecodeError:
        return content.decode("latin-1", errors="replace")


def _is_wb_or_shared_file(ref_file: dict) -> bool:
    mods = ref_file.get("referencefile_mods") or []
    return not mods or any(mod.get("mod_abbreviation") in (None, "WB") for mod in mods)
```

3. In `WBPaper`, right after `load_text_from_pdf_files`, add:

```python
    def load_text_from_abc_markdown(self) -> bool:
        """load the main text and the supplements of the paper from the Markdown files converted by the ABC

        Returns:
            bool: True, the main text has been loaded

        Raises:
            ABCRequestError: if the list of files, the main Markdown file or its conversion to sentences fails
        """
        headers = generate_headers(get_authentication_token())
        ref_files = get_data_from_url(f"https://{ABC_API}/reference/referencefile/show_all/{self.agr_curie}", headers)
        if ref_files is None:
            raise ABCRequestError(f"Could not list the ABC files of paper {self.paper_id} ({self.agr_curie})")
        markdown_files = [ref_file for ref_file in ref_files if ref_file.get("file_extension") == "md"]
        main_files = [ref_file for ref_file in markdown_files
                      if ref_file.get("file_class") == MARKDOWN_MAIN_FILE_CLASS]
        if not main_files:
            raise ABCRequestError(f"No converted Markdown file in ABC for paper {self.paper_id} ({self.agr_curie})")
        main_file = next((ref_file for ref_file in main_files if _is_wb_or_shared_file(ref_file)), main_files[0])
        try:
            main_text = self._get_sentences_from_abc_markdown(main_file, headers)
        except Exception as e:
            raise ABCRequestError(f"Could not load the converted Markdown file of paper {self.paper_id} "
                                  f"({self.agr_curie}): {e}") from e
        if not main_text:
            raise ABCRequestError(f"The converted Markdown file of paper {self.paper_id} ({self.agr_curie}) "
                                  f"has no text")
        self.main_text = main_text
        for supplement in markdown_files:
            if supplement.get("file_class") != MARKDOWN_SUPPLEMENT_FILE_CLASS or \
                    not _is_wb_or_shared_file(supplement):
                continue
            try:
                supplement_text = self._get_sentences_from_abc_markdown(supplement, headers)
            except Exception as e:
                logger.warning(f"Skipping supplement {supplement.get('display_name')} of paper {self.paper_id}: {e}")
                continue
            if supplement_text:
                self.supplemental_docs.append(supplement_text)
        return True

    @staticmethod
    def _get_sentences_from_abc_markdown(ref_file: dict, headers: dict) -> List[str]:
        # file_type='pdf' makes get_data_from_url return the raw bytes of the file
        content = get_data_from_url(f"https://{ABC_API}/reference/referencefile/download_file/"
                                    f"{ref_file['referencefile_id']}", headers, file_type='pdf')
        if not content:
            raise ValueError(f"download of ABC file {ref_file['referencefile_id']} failed")
        return extract_sentences(read_markdown(_decode_markdown(content)))
```

4. In `pyproject.toml`, add `"agr-abc-document-parsers>=1.7.2",` to the `dependencies` list, after `"agr-cognito-py",`. In `requirements.txt`, add the line `agr-abc-document-parsers>=1.7.2`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest tests/literature/test_paper_abc_markdown.py tests/literature/test_paper_abc_emails.py -q -p no:warnings`
Expected: `24 passed` (10 new + 14 existing).

If `test_loads_main_and_wb_supplements_as_sentences` fails only on the exact sentence string: print `paper.main_text`, check how `extract_sentences` splits the fixture, and adjust the expected sentence to the parser's real output. Don't change the loader.

### Task 3: Corpus `text_source` switch and fatal email errors

**Files:**
- Modify: `wbtools/literature/corpus.py`: the `load_from_wb_database` signature (lines 39-48), its docstring, the email filter (lines 120-130) and the text loading block (lines 129-138).
- Modify: `tests/literature/test_paper_abc_emails.py`: class `TestCorpusAuthorEmailFilter`.

**Interfaces:**
- Consumes: `WBPaper.load_text_from_abc_markdown()` (Task 2) and `ABCRequestError`.
- Produces: `CorpusManager.load_from_wb_database(..., text_source: str = "pdf")`, which accepts `"pdf"` or `"abc_markdown"`. Any other value raises `ValueError`. An `ABCRequestError` from the email filter or the Markdown loader propagates to the caller.

- [ ] **Step 1: Update and add the failing tests.** In `tests/literature/test_paper_abc_emails.py`, replace the whole `TestCorpusAuthorEmailFilter` class with:

```python
class TestCorpusAuthorEmailFilter(unittest.TestCase):

    def load(self, contacts_by_paper_id, **kwargs):
        def fake_get_authors(paper, **_):
            outcome = contacts_by_paper_id[paper.paper_id]
            if isinstance(outcome, Exception):
                raise outcome
            return outcome

        cm = CorpusManager()
        with mock.patch("wbtools.literature.corpus.WBDBManager", FakeWBDBManager), \
                mock.patch.object(WBPaper, "load_bib_info", return_value=True), \
                mock.patch.object(WBPaper, "get_authors_with_email_address_in_wb", autospec=True,
                                  side_effect=fake_get_authors):
            cm.load_from_wb_database("db", "user", "passwd", "host", paper_ids=list(contacts_by_paper_id),
                                     load_pdf_files=False, load_curation_info=False,
                                     exclude_no_author_email=True, **kwargs)
        return sorted(paper.paper_id for paper in cm.get_all_papers())

    def test_papers_without_contacts_are_skipped(self):
        paper_ids = self.load({"00000001": [(WBPerson(person_id="two1"), "pi@lab.edu")],
                               "00000002": None})
        self.assertEqual(paper_ids, ["00000001"])

    def test_abc_email_failure_stops_the_load(self):
        with self.assertRaises(ABCRequestError):
            self.load({"00000001": [(WBPerson(person_id="two1"), "pi@lab.edu")],
                       "00000003": ABCRequestError("ABC down")})


class TestCorpusTextSource(unittest.TestCase):

    def load(self, **kwargs):
        cm = CorpusManager()
        with mock.patch("wbtools.literature.corpus.WBDBManager", FakeWBDBManager), \
                mock.patch.object(WBPaper, "load_bib_info", return_value=True), \
                mock.patch.object(WBPaper, "load_text_from_pdf_files", return_value=True) as from_pdf, \
                mock.patch.object(WBPaper, "load_text_from_abc_markdown", return_value=True) as from_markdown:
            cm.load_from_wb_database("db", "user", "passwd", "host", paper_ids=["00000001"],
                                     load_curation_info=False, **kwargs)
        return cm, from_pdf, from_markdown

    def test_pdf_is_the_default(self):
        cm, from_pdf, from_markdown = self.load()
        from_pdf.assert_called_once()
        from_markdown.assert_not_called()
        self.assertEqual(cm.size(), 1)

    def test_abc_markdown(self):
        cm, from_pdf, from_markdown = self.load(text_source="abc_markdown")
        from_markdown.assert_called_once()
        from_pdf.assert_not_called()
        self.assertEqual(cm.size(), 1)

    def test_abc_markdown_failure_stops_the_load(self):
        cm = CorpusManager()
        with mock.patch("wbtools.literature.corpus.WBDBManager", FakeWBDBManager), \
                mock.patch.object(WBPaper, "load_bib_info", return_value=True), \
                mock.patch.object(WBPaper, "load_text_from_abc_markdown", side_effect=ABCRequestError("no md")):
            with self.assertRaises(ABCRequestError):
                cm.load_from_wb_database("db", "user", "passwd", "host", paper_ids=["00000001"],
                                         load_curation_info=False, text_source="abc_markdown")

    def test_unknown_text_source_raises(self):
        with self.assertRaises(ValueError):
            CorpusManager().load_from_wb_database("db", "user", "passwd", "host", paper_ids=["00000001"],
                                                  text_source="grobid")
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest tests/literature/test_paper_abc_emails.py -q -p no:warnings`
Expected: failures in `test_abc_email_failure_stops_the_load` (no exception raised) and in every `TestCorpusTextSource` test (`TypeError: ... unexpected keyword argument 'text_source'`, or the PDF loader is called for `abc_markdown`).

- [ ] **Step 3: Implement** in `wbtools/literature/corpus.py`

1. Signature: add `text_source: str = "pdf"` after `main_file_only: bool = False`:

```python
                              exclude_no_main_text: bool = False, exclude_no_author_email: bool = False,
                              main_file_only: bool = False, text_source: str = "pdf") -> None:
```

2. Docstring: add after the `exclude_no_author_email` line:

```
            text_source (str): where to read the text of the papers from when load_pdf_files is True: "pdf" to
                               convert the PDF files with GROBID, "abc_markdown" to read the Markdown files
                               converted by the ABC
```

3. First statement of the method body, before `main_db_manager = WBDBManager(...)`:

```python
        if text_source not in ("pdf", "abc_markdown"):
            raise ValueError(f"Unknown text_source {text_source}, use 'pdf' or 'abc_markdown'")
```

4. Replace the email filter block (the `if exclude_no_author_email:` block with `try/except ABCRequestError`) with:

```python
                    if exclude_no_author_email and not paper.get_authors_with_email_address_in_wb(
                            blacklisted_email_addresses=blacklisted_email_addresses):
                        logger.info("Skipping paper without any email address in ABC or WB authors with records "
                                    "in WB")
                        continue
```

5. Replace the start of the text loading block:

```python
            if load_pdf_files:
                logger.info("Loading text from PDF files for paper")
                if paper.load_text_from_pdf_files(main_file_only=main_file_only) is False:
                    continue
```

with:

```python
            if load_pdf_files:
                if text_source == "abc_markdown":
                    logger.info("Loading text from ABC Markdown files for paper")
                    paper.load_text_from_abc_markdown()
                else:
                    logger.info("Loading text from PDF files for paper")
                    if paper.load_text_from_pdf_files(main_file_only=main_file_only) is False:
                        continue
```

The `exclude_temp_pdf` and `exclude_no_main_text` checks that follow stay as they are.

6. Change the import line back to `from wbtools.literature.paper import WBPaper`, since `ABCRequestError` is no longer used in `corpus.py`.

- [ ] **Step 4: Run all the new and changed wbtools tests**

Run: `python -m pytest tests/literature/test_paper_abc_emails.py tests/literature/test_paper_abc_markdown.py tests/literature/test_abc_search.py -q -p no:warnings`
Expected: `39 passed`: 19 in the emails file (13 existing + 2 email-filter + 4 text-source), 10 Markdown and 10 search.

- [ ] **Step 5: Lint**

Run: `~/anaconda3/envs/agr_automated_information_extraction/bin/flake8 --max-line-length 120 wbtools/literature/abc_search.py wbtools/literature/paper.py wbtools/literature/corpus.py tests/literature/test_abc_search.py tests/literature/test_paper_abc_markdown.py tests/literature/test_paper_abc_emails.py`
Expected: nothing on the lines this task added or changed. `paper.py` and `corpus.py` already had 4 warnings on untouched lines (e.g. E501); leave those alone.

### Task 4: wbtools version and commit checkpoint

**Files:** Modify `pyproject.toml` (line 7).

- [ ] **Step 1:** Set `version = "3.5.0"` in `pyproject.toml`.
- [ ] **Step 2:** Show `git status --short` and `git diff --stat` to the user. **Wait for the user to say "commit"**. Then:

```bash
git add wbtools/literature/abc_search.py wbtools/literature/paper.py wbtools/literature/corpus.py \
        pyproject.toml requirements.txt tests/literature/test_abc_search.py \
        tests/literature/test_paper_abc_markdown.py tests/literature/test_paper_abc_emails.py
git commit -m "feat(literature): select WB papers from ABC search and read their text from ABC Markdown

Refs: SCRUM-6591"
```

(Add the attribution line from the session instructions.) Do **not** add `dist/` or `wbtools.egg-info/`, which were already untracked.

---

## ACKnowledge (repo `/home/valerio/workspace/caltech/acknowledge`, branch `SCRUM-6591`)

### Task 5: Selection module and config

**Files:**
- Create: `src/backend/pipeline/abc_paper_selection.py`
- Modify: `src/backend/config.yml`: add the `abc_paper_selection` section at the end of the file, at top level.
- Test: `src/backend/pipeline/test_abc_paper_selection.py`

**Interfaces:**
- Consumes: `wbtools.literature.abc_search.get_wb_paper_ids_from_abc` (wbtools Task 1) and `CorpusManager.load_from_wb_database(..., text_source="abc_markdown")` (wbtools Task 3). `CorpusManager.size() -> int`.
- Produces: `load_papers_from_abc(corpus_manager, db_name, db_user, db_password, db_host, selection_config: dict, num_papers: int, today: datetime.date = None) -> None`. `selection_config` is the parsed `abc_paper_selection` section: `{"date_created_window_days": int, "required_workflow_tags": {facet: [ATP ids]}}`.

- [ ] **Step 1: Write the failing tests** in `src/backend/pipeline/test_abc_paper_selection.py`

```python
from datetime import date
from unittest import mock

import pytest

from wbtools.literature.paper import ABCRequestError

from src.backend.pipeline.abc_paper_selection import load_papers_from_abc, LOAD_BATCH_SIZE

SELECTION_CONFIG = {"date_created_window_days": 730,
                    "required_workflow_tags": {"file_workflow": ["ATP:0000163"],
                                               "email_extraction": ["ATP:0000355"]}}


class FakeCorpusManager:
    """records load_from_wb_database calls and adds the first papers_added_per_call ids of each batch"""

    def __init__(self, papers_added_per_call=0):
        self.papers_added_per_call = papers_added_per_call
        self.calls = []
        self.papers = []

    def size(self):
        return len(self.papers)

    def load_from_wb_database(self, db_name, db_user, db_password, db_host, **kwargs):
        self.calls.append(kwargs)
        for paper_id in kwargs["paper_ids"][:self.papers_added_per_call]:
            if kwargs.get("max_num_papers") and self.size() >= kwargs["max_num_papers"]:
                break
            self.papers.append(paper_id)


def candidates(count, start=1):
    return [(f"{i:08d}", f"AGRKB:{i}") for i in range(start, start + count)]


def run(corpus_manager, found, num_papers=10):
    with mock.patch("src.backend.pipeline.abc_paper_selection.get_wb_paper_ids_from_abc",
                    return_value=iter(found)) as search:
        load_papers_from_abc(corpus_manager, "db", "user", "pw", "host", SELECTION_CONFIG, num_papers,
                             today=date(2026, 9, 24))
    return search


def test_search_uses_config_tags_and_window():
    search = run(FakeCorpusManager(), candidates(1))
    search.assert_called_once_with(required_workflow_tags=SELECTION_CONFIG["required_workflow_tags"],
                                   date_created_from="2024-09-24", date_created_to="2026-09-24")


def test_batches_are_loaded_with_the_abc_filters():
    cm = FakeCorpusManager()
    run(cm, candidates(3), num_papers=5)
    assert cm.calls == [{"paper_ids": ["00000001", "00000002", "00000003"], "max_num_papers": 5,
                         "text_source": "abc_markdown", "must_be_autclass_flagged": False,
                         "exclude_afp_processed": True, "exclude_afp_not_curatable": True,
                         "exclude_no_main_text": True, "exclude_no_author_email": True, "exclude_temp_pdf": True}]


def test_candidates_are_loaded_in_batches():
    cm = FakeCorpusManager()
    run(cm, candidates(LOAD_BATCH_SIZE + 20), num_papers=10)
    assert [len(call["paper_ids"]) for call in cm.calls] == [LOAD_BATCH_SIZE, 20]


def test_stops_once_enough_papers_are_loaded():
    cm = FakeCorpusManager(papers_added_per_call=4)
    run(cm, candidates(LOAD_BATCH_SIZE * 3), num_papers=6)
    assert len(cm.calls) == 2
    assert cm.size() == 6


def test_stops_when_candidates_run_out():
    cm = FakeCorpusManager(papers_added_per_call=1)
    run(cm, candidates(3), num_papers=10)
    assert len(cm.calls) == 1
    assert cm.size() == 1


def test_duplicate_candidates_are_loaded_once():
    cm = FakeCorpusManager()
    run(cm, candidates(2) + candidates(2) + candidates(1, start=3), num_papers=10)
    loaded = [paper_id for call in cm.calls for paper_id in call["paper_ids"]]
    assert loaded == ["00000001", "00000002", "00000003"]


def test_abc_errors_propagate():
    cm = FakeCorpusManager()
    with mock.patch("src.backend.pipeline.abc_paper_selection.get_wb_paper_ids_from_abc",
                    side_effect=ABCRequestError("search down")):
        with pytest.raises(ABCRequestError):
            load_papers_from_abc(cm, "db", "user", "pw", "host", SELECTION_CONFIG, 10, today=date(2026, 9, 24))
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `python -m pytest src/backend/pipeline/test_abc_paper_selection.py -q -p no:warnings`
Expected: collection ERROR, `ModuleNotFoundError: No module named 'src.backend.pipeline.abc_paper_selection'`.

- [ ] **Step 3: Implement** `src/backend/pipeline/abc_paper_selection.py`

```python
import logging
from datetime import date, timedelta
from itertools import islice

from wbtools.literature.abc_search import get_wb_paper_ids_from_abc

logger = logging.getLogger(__name__)

LOAD_BATCH_SIZE = 50


def load_papers_from_abc(corpus_manager, db_name, db_user, db_password, db_host, selection_config, num_papers,
                         today=None):
    """Load into corpus_manager up to num_papers WB papers selected from the ABC.

    Candidates are the WB papers created in the configured window that have all the required ABC workflow tags,
    newest first. They are loaded in batches through the corpus manager, which skips the papers already
    processed by ACKnowledge and the ones that are not curatable. Errors from the ABC (ABCRequestError)
    propagate: they stop the run before any paper is processed.
    """
    today = today or date.today()
    date_created_from = (today - timedelta(days=selection_config["date_created_window_days"])).isoformat()
    found = get_wb_paper_ids_from_abc(required_workflow_tags=selection_config["required_workflow_tags"],
                                      date_created_from=date_created_from, date_created_to=today.isoformat())
    candidates = _unique_paper_ids(found)
    while corpus_manager.size() < num_papers:
        batch = list(islice(candidates, LOAD_BATCH_SIZE))
        if not batch:
            break
        logger.info(f"Loading {len(batch)} candidate papers selected from ABC")
        corpus_manager.load_from_wb_database(
            db_name, db_user, db_password, db_host, paper_ids=batch, max_num_papers=num_papers,
            text_source="abc_markdown", must_be_autclass_flagged=False, exclude_afp_processed=True,
            exclude_afp_not_curatable=True, exclude_no_main_text=True, exclude_no_author_email=True,
            exclude_temp_pdf=True)
    logger.info(f"{corpus_manager.size()} papers selected from ABC")


def _unique_paper_ids(found):
    # the ABC search can return a paper twice when references are created while it is paged
    seen = set()
    for wb_paper_id, _ in found:
        if wb_paper_id not in seen:
            seen.add(wb_paper_id)
            yield wb_paper_id
```

Append to `src/backend/config.yml`, at top level:

```yaml

abc_paper_selection:
  # WB papers created in the ABC in the last date_created_window_days days are candidates
  date_created_window_days: 730
  # a candidate must have all these ABC workflow tags, grouped by ABC search facet
  required_workflow_tags:
    file_workflow:
      - ATP:0000163  # file converted to text
    email_extraction:
      - ATP:0000355  # email extraction complete
    entity_extraction:
      - ATP:0000214  # gene extraction complete
      - ATP:0000215  # allele extraction complete
      - ATP:0000250  # strain extraction complete
      - ATP:0000251  # transgenic allele extraction complete
      - ATP:0000203  # species extraction complete
    reference_classification:
      - ATP:0000170  # expression classification complete (otherexpr)
      - ATP:0000168  # catalytic activity classification complete (catalyticact)
      - ATP:0000171  # genetic interaction classification complete (geneint)
      - ATP:0000244  # physical interaction classification complete (geneprod)
      - ATP:0000245  # regulatory interaction classification complete (genereg)
      - ATP:0000222  # RNAi classification complete (rnai)
      - ATP:0000247  # allele phenotype classification complete (newmutant)
      - ATP:0000248  # transgene overexpression phenotype classification complete (overexpr)
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `python -m pytest src/backend/pipeline/test_abc_paper_selection.py -q -p no:warnings`
Expected: `7 passed`.

- [ ] **Step 5: Check the config parses**

Run: `python -c "from src.backend.common.config import load_config_from_file as l; c = l()['abc_paper_selection']; print(c['date_created_window_days'], sum(len(v) for v in c['required_workflow_tags'].values()))"`
Expected: `730 15`.

### Task 6: Wire the selection into process_papers.py

**Files:** Modify `src/backend/pipeline/process_papers.py`: imports (lines 11-15) and the corpus loading block (lines 104-116).

**Interfaces:**
- Consumes: `load_papers_from_abc` (Task 5) and `config["abc_paper_selection"]`. `config` is already loaded at line 96.

- [ ] **Step 1: Implement.** Add the import after `from src.backend.common.emailtools import *`:

```python
from src.backend.pipeline.abc_paper_selection import load_papers_from_abc
```

Replace the block:

```python
    cm = CorpusManager()
    if args.paper_ids:
        cm.load_from_wb_database(
            args.db_name, args.db_user, args.db_password, args.db_host,
            must_be_autclass_flagged=True, exclude_no_main_text=True,
            exclude_no_author_email=True, exclude_temp_pdf=True, paper_ids=args.paper_ids)
    else:
        cm.load_from_wb_database(
            args.db_name, args.db_user, args.db_password, args.db_host,
            from_date=(datetime.now() - timedelta(days=2*365))
                .strftime("%m-%d-%Y"), max_num_papers=args.num_papers, must_be_autclass_flagged=True,
            exclude_afp_processed=True, exclude_afp_not_curatable=True, exclude_no_main_text=True,
            exclude_no_author_email=True, exclude_temp_pdf=True)
```

with:

```python
    cm = CorpusManager()
    if args.paper_ids:
        cm.load_from_wb_database(
            args.db_name, args.db_user, args.db_password, args.db_host,
            must_be_autclass_flagged=False, exclude_no_main_text=True,
            exclude_no_author_email=True, exclude_temp_pdf=True, paper_ids=args.paper_ids,
            text_source="abc_markdown")
    else:
        load_papers_from_abc(cm, args.db_name, args.db_user, args.db_password, args.db_host,
                             selection_config=config["abc_paper_selection"], num_papers=args.num_papers)
```

If `datetime`/`timedelta` are now unused in `process_papers.py`, check with `grep -n "datetime\|timedelta" src/backend/pipeline/process_papers.py`. If the only remaining hit is the import line, remove it.

- [ ] **Step 2: Check the module imports and all pipeline tests pass**

Run: `python -c "import src.backend.pipeline.process_papers" && python -m pytest src/backend/pipeline -q -p no:warnings`
Expected: no import error; `27 passed` (20 existing + 7 new).

- [ ] **Step 3: Lint**

Run: `~/anaconda3/envs/agr_automated_information_extraction/bin/flake8 --max-line-length 120 src/backend/pipeline/abc_paper_selection.py src/backend/pipeline/test_abc_paper_selection.py`
Expected: no output. `process_papers.py` has existing warnings (star import, whitespace). Only check that the changed lines add none: `git diff -U0 src/backend/pipeline/process_papers.py | grep '^+' | grep -n ' $'` prints nothing.

---

## Verification

### Task 7: Read-only check against production ABC

Uses the wbtools checkout (editable install) and the Cognito credentials in `/home/valerio/workspace/caltech/wbtools/.env`. Never print the token or secrets.

- [ ] **Step 1: Run the real search and the Markdown loader on the newest papers.** Put this script in the session scratchpad and run it from `/home/valerio/workspace/caltech/wbtools`:

```python
import dotenv
from datetime import date, timedelta
from itertools import islice
dotenv.load_dotenv(".env")
import yaml
from wbtools.literature.abc_search import get_wb_paper_ids_from_abc
from wbtools.literature.paper import WBPaper

selection = yaml.safe_load(open("/home/valerio/workspace/caltech/acknowledge/src/backend/config.yml"))["abc_paper_selection"]
tags = selection["required_workflow_tags"]
dev_tags = dict(tags, entity_extraction=[t for t in tags["entity_extraction"] if t != "ATP:0000215"])
window = ((date.today() - timedelta(days=selection["date_created_window_days"])).isoformat(), date.today().isoformat())
for label, required in (("production tags", tags), ("dev tags (no allele)", dev_tags)):
    found = list(get_wb_paper_ids_from_abc(required, *window))
    print(label, "->", len(found), "papers; newest:", found[:3])
for wb_id, curie in islice(get_wb_paper_ids_from_abc(dev_tags, *window), 3):
    paper = WBPaper(paper_id=wb_id, agr_curie=curie)
    paper.load_text_from_abc_markdown()
    print(wb_id, curie, "main sentences:", len(paper.main_text), "supplements:", len(paper.supplemental_docs))
```

Expected:
- the production tag list gives a small number, because of SCRUM-6596;
- the dev list gives several hundred papers, newest first;
- each of the three papers loads with a non-zero sentence count, and some have supplements.

### Task 8: End-to-end run on caltech-curation-dev (also covers SCRUM-5507)

Pushing the wbtools branch is outward-facing, so **ask the user before Step 1.**

- [ ] **Step 1: Push the wbtools branch** so the dev container can install it:
  `cd /home/valerio/workspace/caltech/wbtools && git push -u origin SCRUM-6591`.
- [ ] **Step 2: Build a throwaway image from the ACKnowledge branch** on the dev server. This also needs the ACKnowledge branch pushed; ask first.

```bash
ssh caltech-curation-dev 'set -e; D=/tmp/scrum6591-test; rm -rf $D
  git clone -q --branch SCRUM-6591 --depth 1 https://github.com/WormBase/ACKnowledge $D; cd $D
  sed -i "/ATP:0000215/d" src/backend/config.yml
  docker build -q -t afp_pipeline_scrum6591_test -f src/backend/pipeline/Dockerfile .'
```

- [ ] **Step 3: Run one paper in dev mode.** It uses the dev API container's environment, a blank Textpresso token, and wbtools from the branch:

```bash
ssh caltech-curation-dev 'docker run --rm --env-file <(docker inspect --type container afp_api_test --format "{{range .Config.Env}}{{println .}}{{end}}" | grep -E "^(DB_|ADMINS=|EMAIL_|AFP_BASE_URL=|COGNITO_)") afp_pipeline_scrum6591_test bash -c '"'"'pip install -q git+https://github.com/WormBase/wbtools@SCRUM-6591 && python3 src/backend/pipeline/process_papers.py -L INFO -n 1 -d -p "$EMAIL_PASSWD" -S "$EMAIL_SMTP_USER" -N "$DB_NAME" -U "$DB_USER" -P "$DB_PASSWD" -H "$DB_HOST" -a ${ADMINS//,/ } -u "$AFP_BASE_URL" -t ""'"'"' 2>&1' | tee /tmp/claude-1000/-home-valerio-workspace-caltech-acknowledge/28b52dfa-4e73-41dc-9f96-fe9e7571486b/scratchpad/scrum6591_e2e.log
```

Expected in the log:
- `Loading N candidate papers selected from ABC`
- `Loading text from ABC Markdown files for paper`, and **no** `Started pdf to text conversion`
- `Paper … added to corpus`
- `Sending email to … (person_id: …)`: the recipients picked from the ABC emails, or the WB fallback
- `Pipeline finished successfully`

The admins get the dev test email and the summary. Record the paper ID and its recipients for SCRUM-6591/SCRUM-5507.

- [ ] **Step 4: Clean up** `docker rmi afp_pipeline_scrum6591_test; rm -rf /tmp/scrum6591-test` on the dev server.

## Release (after the user approves the E2E result)

### Task 9: Commit, merge, publish, deploy

- [ ] **Step 1: ACKnowledge commit checkpoint.** Show `git status` to the user. After they say "commit", stage the plan, the spec, `src/backend/pipeline/abc_paper_selection.py`, `src/backend/pipeline/test_abc_paper_selection.py`, `src/backend/pipeline/process_papers.py` and `src/backend/config.yml`, and commit with `feat(pipeline): select papers from ABC search and read their text from ABC Markdown (SCRUM-6591)`.
- [ ] **Step 2: Publish wbtools 3.5.0** (only on the user's go-ahead):
  - fast-forward `SCRUM-6591` into `main` and push;
  - build in a scratch venv into a clean scratchpad folder;
  - `twine check`, then `twine upload -r wbtools`;
  - confirm with `pip download wbtools==3.5.0`.
- [ ] **Step 3: Bump the ACKnowledge pin.** Set `wbtools==3.5.0` in `requirements.txt` and commit (after "commit"). Fast-forward `SCRUM-6591` into `develop` and push. Jenkins `acknowledge-dev` rebuilds the dev API; check the build result.
- [ ] **Step 4: Update SCRUM-6591** with the E2E results (paper, recipients, log lines). The production deploy (`master`) is the user's call.
