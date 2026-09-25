# SCRUM-6592: pre-populate entities from ABC instead of extracting them in ACKnowledge

Jira: [SCRUM-6592](https://agr-jira.atlassian.net/browse/SCRUM-6592). Part of the ACKnowledge → ABC transition
(spike SCRUM-3749). Builds on SCRUM-6591 (papers selected from ABC search, wbtools 3.5.x). Related: SCRUM-6596
(WB allele extraction bug at ABC), SCRUM-6593 (classifications, which now includes `tfp_antibody`).

## Goal

The pipeline (`src/backend/pipeline/process_papers.py`) takes the genes, alleles, strains, transgenes and
species it pre-populates from ABC's entity extraction (`abc_entity_extractor` topic entity tags). It stops
extracting them itself. The pipeline no longer needs:
- the paper text;
- NttExtractor;
- the WB curated entity lists;
- the Textpresso API.

The `tfp_*` formats stay the same, so the author form, curator dashboard and statistics don't change.

## Decisions

- Source: only `abc_entity_extractor` tags, with topics gene ATP:0000005, allele ATP:0000285 (classical allele),
  strain ATP:0000027, transgenic allele ATP:0000110 and species ATP:0000123.
- WB entities only: `WB:` curies for genes, alleles, strains and transgenes, and `NCBITaxon:` for species.
  Other MODs' entities (e.g. an FB gene matched in a WB paper) are dropped. Multi-species support is future
  work.
- ACKnowledge's exclusion lists (`config.yml` `ntt_extraction.exclusion_list`) are applied to the ABC
  results after fetching them:
  - genes and strains are matched by entity name (e.g. `M9`, which is M9 buffer, not a strain);
  - species are matched by NCBI taxon id.
- The TF-IDF and occurrence thresholds and the species inclusion list are not applied, because ABC's
  extractor applies its own. The `ntt_extraction` section stays in `config.yml` unchanged, because
  `test_extract_sgd_genes.py` still uses it.
- `tfp_antibody` is out of scope. It is a classification, handled in SCRUM-6593. The pipeline keeps whatever
  `save_extracted_data_to_db` does for it today.
- Alleles: in production, SCRUM-6591's selection requires "allele extraction complete" (ATP:0000215), so every
  selected paper has ABC allele tags once SCRUM-6596 is fixed. In dev (where the tag is not required),
  papers without allele tags simply get no alleles.
- **Import cutoff: 2026-09-25.** From this date on, `tfp_*` pipeline values come from ABC and must not be
  imported into ABC as `ACKnowledge_pipeline` tags. Manual ACKnowledge→ABC imports only take `tfp_*` rows
  dated before the cutoff. Author submissions (`afp_*`, imported as `ACKnowledge_form`) are not affected.
  - Nothing is lost: the newest production `tfp_*` row is from 2026-08-19, and ABC's newest
    `ACKnowledge_pipeline` tag is from 2026-08-20.
  - Condition: production stays on its current version until this story ships together with SCRUM-6591.

## Components

### wbtools 3.6.0

1. **`wbtools/literature/abc_entities.py`:** `get_abc_extracted_entities(agr_curies: List[str]) ->
   Dict[str, Dict[str, List[Tuple[str, str]]]]`
   - It calls `POST https://{API_SERVER}/topic_entity_tag/by_references` in batches of 100 curies, with the
     body `{"curies_or_reference_ids": batch, "filters": {"source_methods": ["abc_entity_extractor"],
     "topics": [the five topics]}}`.
   - It returns `{curie: {"gene"|"allele"|"strain"|"transgene"|"species": [(entity_curie, entity_name)]}}`,
     with every curie present and empty lists when a paper has no tags.
   - Negated tags ("no entities of this type") are skipped.
   - Only `WB:` entities are kept for genes, alleles, strains and transgenes, and only `NCBITaxon:` for
     species.
   - The type comes from the tag's `topic`, and the classical allele topic ATP:0000285 maps to "allele".
   - A failed request, a response containing `error`, or a missing `tags` key raises `ABCRequestError`.
   - It uses `get_authentication_token` / `generate_headers` and the 300-second request timeout, like the
     other ABC calls.

### ACKnowledge

2. **`src/backend/pipeline/abc_entities.py`:** `to_tfp_values(entities: Dict[str, List[Tuple[str, str]]],
   exclusion_lists: Dict[str, List[str]]) -> Dict[str, List[str]]`
   - The keys are `genes`, `alleles`, `strains`, `transgenes` and `species`.
   - Formats, matching the ones `process_papers.py` writes today:
     - genes: `WB:WBGene00002974` + `lev-1` → `00002974;%;lev-1`;
     - alleles, strains and transgenes: `WB:WBVar…` / `WB:WBStrain…` / `WB:WBTransgene…` + name →
       `WBVar…;%;name` (the `WB:` prefix is dropped);
     - species: the entity name only (e.g. `Caenorhabditis elegans`).
   - Genes and strains whose name is in their exclusion list are dropped. Species whose taxon id (the
     `NCBITaxon:` suffix) is in the species exclusion list are dropped. The allele and transgene lists
     are empty today but are applied the same way, by name.
   - Duplicates are merged. A missing name falls back to the id (e.g. `WBVar…`) with a warning. Output is
     sorted by name.
3. **`process_papers.py`**
   - Selection passes `load_pdf_files=False`, both through `load_papers_from_abc` and for `--paper-ids`, so no
     paper text is downloaded. `exclude_no_main_text` and `exclude_temp_pdf` are dropped from those calls,
     because they only apply to loaded text.
   - After selection, one `get_abc_extracted_entities([paper.agr_curie for paper in cm.get_all_papers()])`
     call fetches everything. For each paper, `to_tfp_values(...)` produces the lists passed to
     `save_extracted_data_to_db(genes=..., alleles=..., species=..., strains=..., transgenes=...)`. A log line
     records the counts.
   - Removed from the pipeline:
     - `NttExtractor`, `TextpressoLiteratureIndex`, `extract_meaningful_entities_with_retry` and
       `retry_with_backoff`;
     - the curated-list and name-id-map queries, `ObsoleteStrainsFilter` and the taxon map;
     - the `-t/--textpresso-token` argument.
   - `obsolete_strains_filter.py` itself stays, because it has its own entry point.
   - Unchanged: the ABC email lookup, `save_extracted_data_to_db`, and the emails.
4. **`src/backend/pipeline/crontab`:** drop `-t $TEXTPRESSO_TOKEN` from the `process_papers.py` line.
5. **`src/backend/config.yml`:** add `abc_entities: {import_cutoff: 2026-09-25}` with a comment explaining the
   cutoff and pointing to SCRUM-6592. The pipeline logs this value at startup. The ACK `requirements.txt`
   pin becomes `wbtools==3.6.0`.

## Data flow

```
config.yml ─> process_papers.py ─> load_papers_from_abc(load_pdf_files=False)   (ABC search, Caltech afp_* checks)
                                     │ corpus of papers with agr_curie
                                     ▼
                         get_abc_extracted_entities(curies)   (ABC topic entity tags, batches of 100)
                                     │ per paper: {type: [(curie, name)]}
                                     ▼
                         to_tfp_values(entities, exclusion_lists)
                                     │ genes / alleles / strains / transgenes / species in tfp_* formats
                                     ▼
                         ABC emails → save_extracted_data_to_db → emails   (unchanged)
```

## Error handling

| Situation | Behaviour |
|---|---|
| ABC topic entity tag request fails | `ABCRequestError`; the run stops before anything is saved or emailed |
| A type has only a negated tag, or no tags at all | empty list for that type; a warning when a paper has no entity tags at all |
| The same entity in several tags | kept once |
| A tag without `entity_name` | the id is used as the name, with a warning |
| A non-WB entity | dropped |
| An entity on an exclusion list | dropped |

## Testing

- **wbtools unit tests** (ABC HTTP mocked):
  - the request body and filters, and batching into groups of 100;
  - the result shape, and curies missing from the response returned empty;
  - negated tags skipped;
  - non-WB entities dropped while `NCBITaxon:` species are kept;
  - the ATP:0000285 → allele mapping;
  - HTTP, connection and `error`-body failures raise `ABCRequestError`.
- **ACKnowledge unit tests:**
  - `to_tfp_values`: every format, the exclusion lists (names and taxon ids), duplicates, a missing name,
    and sorting;
  - a pipeline wiring test with a fake corpus manager and a mocked ABC call: the lists passed to
    `save_extracted_data_to_db`, and no text loading.
- **Comparison against production (read-only), attached to SCRUM-6592:** for about 30 recent WB papers
  that ACKnowledge processed before the cutoff, compare their production `tfp_*` values with what
  `to_tfp_values(get_abc_extracted_entities(...))` produces. Report overlap, ABC-only and ACKnowledge-only
  counts per type.
- **End-to-end on dev** (one paper, `-d`, allele tag left out of the dev config):
  - the log shows the ABC entity counts, and no Textpresso, curated-list or text loading;
  - the admin email is received;
  - the dev `tfp_*` rows match the paper's ABC tags.

## Release

1. wbtools `SCRUM-6592` → `main`, then publish 3.6.0 to PyPI.
2. ACKnowledge `SCRUM-6592`: bump the pin, merge to `develop`, and let Jenkins deploy to dev.
3. The production deploy (`master`) ships together with SCRUM-6591, when the user decides.

## Out of scope

- `tfp_antibody` and classifications (SCRUM-6593); the ACKnowledge workflow tag (SCRUM-6594); dashboard text
  (SCRUM-6595).
- Multi-species entities.
- Removing NttExtractor, Textpresso or GROBID code from wbtools: other callers (the SGD script, the dashboard)
  still use them.
