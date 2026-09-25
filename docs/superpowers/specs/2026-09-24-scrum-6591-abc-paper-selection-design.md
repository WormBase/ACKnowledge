# SCRUM-6591: select papers from ABC search and read their text from ABC Markdown

Jira: [SCRUM-6591](https://agr-jira.atlassian.net/browse/SCRUM-6591). Part of the ACKnowledge → ABC transition
(spike SCRUM-3749). Related: SCRUM-5507 (ABC emails, tested here), SCRUM-6592 (ABC entities, later),
SCRUM-6596 (WB allele extraction bug at ABC).

## Goal

The pipeline (`src/backend/pipeline/process_papers.py`) chooses the papers to process from ABC, which is
now the source of truth for WB literature, instead of the WB database. It reads their text from ABC's
converted Markdown files instead of downloading PDFs and converting them with GROBID on cervino, which is
down. Entity extraction stays on the fly in ACKnowledge until SCRUM-6592.

Removing GROBID in this story makes the pipeline runnable, and therefore testable end to end, before
SCRUM-6592 is done. That testing includes the ABC email change from SCRUM-5507.

## Decisions

- A paper is selected only when ABC has it in the WB corpus and it has **every** required workflow tag:
  - file converted to text
  - email extraction complete
  - entity extraction complete for each entity type
  - classification complete for each datatype ACKnowledge pre-flags
- The required tags live in `config.yml` so an environment can relax the list. Dev leaves out the allele
  tag until SCRUM-6596 is fixed.
- ABC-access code goes in wbtools, which is meant to become the ABC module; ACKnowledge orchestrates.
  Persons, the email blacklist and ACKnowledge's own `afp_*`/`tfp_*` state stay in the WB database.
- There is no ACKnowledge workflow tag yet (SCRUM-6594). Every run pages through all matching papers and
  excludes those already processed using the Caltech `afp_*` tables.
- Errors that mean ABC is broken stop the run. Nothing from that run is saved or emailed.

## Components

### wbtools 3.5.0

1. **`wbtools/literature/abc_search.py`**: `get_wb_paper_ids_from_abc(required_workflow_tags,
   date_created_from, date_created_to)`
   - `required_workflow_tags` is a dict from search facet name to a list of ATP ids, e.g.
     `{"file_workflow": ["ATP:0000163"], ...}`.
   - It POSTs to `https://{API_SERVER}/search/references/` with:
     - `facets_values = {"mods_in_corpus.keyword": ["WB"], **required_workflow_tags}` (values in one
       facet are ANDed);
     - `date_created = [from, to]`;
     - `sort = [{"date_created": {"order": "desc"}}]`;
     - `size_result_count = 100`, and `page` increasing from 1.
   - It is a generator yielding `(wb_paper_id, agr_curie)`, with `wb_paper_id` taken from the
     `WB:WBPaper…` cross-reference without the prefix. It stops after the first page with fewer than
     100 hits.
   - Hits without a `WB:WBPaper` cross-reference are skipped with a warning.
   - A failed request, or a response containing `error`, raises `ABCRequestError`.
2. **`WBPaper.load_text_from_abc_markdown()`** in `wbtools/literature/paper.py`
   - Lists the files with `GET /reference/referencefile/show_all/{agr_curie}`.
   - Main text: the `converted_merged_main` `.md` file. Prefer one scoped to WB or stored with no MOD,
     otherwise take any; this matches agr_automated_information_extraction `_try_download_main_md`.
   - Supplements: every `converted_merged_supplement` `.md` file scoped to WB or with no MOD.
   - Downloads with `/reference/referencefile/download_file/{id}` and parses with
     `agr-abc-document-parsers` (`read_markdown` + `extract_plain_text` for the main file; the same per
     supplement).
   - Fills `main_text`, and appends one entry per supplement to `supplemental_docs`.
   - Errors:
     - no main Markdown row, a failed download or a parse failure raises `ABCRequestError`, because the
       "converted" tag guarantees the file exists;
     - a failed supplement is logged as a warning and skipped.
   - `agr-abc-document-parsers` is added to wbtools' dependencies. It needs Python ≥ 3.8 and only
     depends on `lxml`; tested on 3.8.18.
3. **`CorpusManager.load_from_wb_database(..., text_source="pdf")`**
   - A new parameter. `"abc_markdown"` calls `load_text_from_abc_markdown()` wherever
     `load_text_from_pdf_files()` is called today. The default `"pdf"` keeps the current behaviour for
     other wbtools users.
   - The 3.4.0 `try/except ABCRequestError` around `get_authors_with_email_address_in_wb` in the email
     filter is removed. An ABC email error propagates instead of skipping the paper.

### ACKnowledge

4. **`src/backend/config.yml`**, new section:

   ```yaml
   abc_paper_selection:
     date_created_window_days: 730
     required_workflow_tags:
       file_workflow:
         - ATP:0000163            # file converted to text
       email_extraction:
         - ATP:0000355            # email extraction complete
       entity_extraction:
         - ATP:0000214            # gene extraction complete
         - ATP:0000215            # allele extraction complete (drop in dev until SCRUM-6596 is fixed)
         - ATP:0000250            # strain extraction complete
         - ATP:0000251            # transgenic allele extraction complete
         - ATP:0000203            # species extraction complete
       reference_classification:
         - ATP:0000170            # expression (otherexpr)
         - ATP:0000168            # catalytic activity (catalyticact)
         - ATP:0000171            # genetic interaction (geneint)
         - ATP:0000244            # physical interaction (geneprod)
         - ATP:0000245            # regulatory interaction (genereg)
         - ATP:0000222            # RNAi (rnai)
         - ATP:0000247            # allele phenotype (newmutant)
         - ATP:0000248            # transgene overexpression phenotype (overexpr)
   ```

   `seqchange` has no ABC classifier, so there is no tag for it (open question in SCRUM-6593).

5. **`process_papers.py`**
   - Without `--paper-ids`:
     - read `abc_paper_selection`, compute the window (today − `date_created_window_days` to today) and
       iterate `get_wb_paper_ids_from_abc(...)`;
     - collect IDs in batches of 50 and call `cm.load_from_wb_database(paper_ids=batch,
       max_num_papers=num_papers, text_source="abc_markdown", ...)` on the same `CorpusManager`;
     - `max_num_papers` counts the corpus across calls, so stop when `cm.size() >= num_papers` or the
       generator is exhausted.
   - Filters passed on every batch:
     - `exclude_afp_processed=True`, `exclude_afp_not_curatable=True`: the Caltech "already processed"
       and "curatable" checks;
     - `exclude_no_author_email=True`, `exclude_no_main_text=True`, `exclude_temp_pdf=True`: as today;
     - `must_be_autclass_flagged=False`: the `cur_blackbox` gate is dropped.
   - With `--paper-ids`: load those IDs directly, as today, with `text_source="abc_markdown"` and
     `must_be_autclass_flagged=False`. The processed and curatable checks stay off there, as today.
   - Everything after the corpus is loaded is unchanged: NttExtractor with Textpresso, the ABC email
     lookup, `save_extracted_data_to_db`, and the emails to authors or admins.
   - The pinned version in `requirements.txt` becomes `wbtools==3.5.0`.

## Data flow

```
config.yml ──> process_papers.py ──> abc_search.get_wb_paper_ids_from_abc()  (ABC search, pages of 100)
                     │                         │ (WBPaper id, curie)
                     │            batches of 50 ▼
                     └──> CorpusManager.load_from_wb_database(paper_ids=batch, text_source="abc_markdown")
                              ├─ Caltech afp_* processed / curatable checks (WB db)
                              ├─ bib info (ABC), authors (WB db)
                              ├─ ABC emails -> WB persons (fallback: WB author emails)
                              └─ WBPaper.load_text_from_abc_markdown() (ABC Markdown, main + supplements)
                     ──> entity extraction (unchanged) ──> tfp_* / afp_* (WB db) ──> emails
```

## Error handling

| Situation | Behaviour |
|---|---|
| ABC search fails | `ABCRequestError`; the run stops before any paper is processed |
| Hit without a `WB:WBPaper` cross-reference | skipped, warning |
| ABC email lookup fails | `ABCRequestError`; the run stops |
| ABC returns no emails (`[]`), or no address matches a WB person | fall back to WB author emails; skip the paper if none remain (unchanged) |
| Main Markdown missing, or download/parse fails | `ABCRequestError`; the run stops |
| A supplement fails to download or parse | warning; continue with the main text and the remaining supplements |

Selection and loading finish before any paper is processed, so a stopped run saves nothing and sends no
email. The next cron run starts clean.

## Testing

- **wbtools unit tests** (pytest, ABC HTTP mocked):
  - search: request body (facets, WB corpus, window, sort), paging until a short page, curie and WBPaper
    mapping, skipping hits without a WB cross-reference, raising on errors;
  - Markdown loader: main plus supplements, a missing main file raises, a failed supplement is skipped,
    and it parses a trimmed real ABC Markdown fixture (WBPaper00068500);
  - corpus: `text_source` dispatch, and `ABCRequestError` from the email filter propagating.
- **ACKnowledge unit test:** the selection loop builds the search call from the config, loads in batches
  with the right filters, and stops at N papers or when results run out.
- **Read-only production check:** run the real search with the configured tags and load the Markdown of
  a few recent papers through the new loader.
- **End-to-end on dev (also covers SCRUM-5507):**
  - build a throwaway pipeline image from the branches and run `process_papers.py -n 1 -d` with the dev
    environment, a blank Textpresso token, and a config without ATP:0000215;
  - check in the log that the paper came from ABC search, its text came from Markdown with no GROBID
    call, and its recipients came from the ABC emails or the WB fallback;
  - check that the admin test email arrives.

## Release

1. wbtools `SCRUM-6591` → `main`, publish 3.5.0 to PyPI.
2. ACKnowledge `SCRUM-6591`: bump the pin, merge to `develop`, and let Jenkins deploy to dev.
3. Production deploy (`master`) once the dev test passes.

## Out of scope

- ABC entities (SCRUM-6592), ABC classifications (SCRUM-6593), the ACKnowledge workflow tag
  (SCRUM-6594), the curator dashboard text view (SCRUM-6595). The dashboard does get the new wbtools,
  but keeps calling `load_from_wb_database` with the default `text_source="pdf"`. Its `converted_text`
  request also uses the email filter, so an ABC email error now fails that request instead of skipping
  the paper.
- Removing the PDF/GROBID code path from wbtools.
