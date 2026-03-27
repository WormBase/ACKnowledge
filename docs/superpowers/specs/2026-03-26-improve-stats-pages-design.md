# Improve Stats Pages — Design Spec

**Issue**: WormBase/ACKnowledge#410
**Date**: 2026-03-26
**Scope**: Redesign the curator dashboard stats pages into a unified, comprehensive view covering entities, data type flags, curator agreement, and contributor demographics. PDF certificate generation is out of scope (separate ticket).

---

## 1. Page Structure & Navigation

Consolidate the current two stats pages (Overall Stats at `/stats` and Extraction Stats at `/papers_stats`) into a **single unified Stats page** with tab-based navigation.

**Tabs:**
1. **Overview** — KPI cards, overall agreement, response rates, time-to-submit
2. **Entities** — Confirmation rates for genes, species, alleles, strains, transgenes (pipeline vs author vs curator)
3. **Data Type Flags** — Prediction accuracy + author flag counts + curator validation status
4. **Contributors** — Submission demographics by role at time of submission

Old routes (`/stats`, `/papers_stats`) both point to this page with different default tabs. Each tab loads data lazily (fetched only when selected).

---

## 2. Overview Tab

### 2a. Existing KPI Cards (unchanged)
- Total Processed
- Response Rate (%)
- Avg. Days to Submit
- Awaiting Response
- Unique Contributors

### 2b. Overall Agreement Cards (new)

Three new cards below the existing KPIs, each showing a macro-averaged agreement rate:

| Card | Calculation |
|------|-------------|
| **Predicted vs Author** | Average of: entity confirmation rates (5 entity types) + prediction accuracy for auto-detected flags (9 data types) |
| **Author vs Curator** | Average of: author-curator entity agreement (genes, species) + author-curator flag agreement (all 17 data types via `cur_curdata`) |
| **Predicted vs Curator** | Average of: pipeline-curator entity agreement (genes, species) + prediction-curator flag agreement (9 auto-detected data types) |

Each card shows the overall percentage, color-coded green (>=80%) / yellow (>=60%) / red (<60%). Hover/click shows breakdown by category.

### 2c. Existing Charts
- Response rate pie chart (unchanged)
- Response rate time series (unchanged)
- Time-to-submit trend — remove the secondary "Number of submissions" column series and right y-axis; show only the average days line chart to reduce visual clutter

---

## 3. Entities Tab

Each section follows a consistent pattern: bar chart → detail table → trend chart.

### 3a. Horizontal Stacked Bar Chart — Entity Breakdown

A horizontal stacked bar chart with one bar per entity type (genes, species, alleles, strains, transgenes). Each bar is segmented by color:
- **Green** — Confirmed (entities in both TFP and AFP)
- **Blue** — Added by authors (entities in AFP but not TFP)
- **Pale red / light coral** — Removed by authors (entities in TFP but not AFP) — lighter color to visually distinguish "what was rejected" from the primary submission data

Bars sorted descending by **total submitted** (confirmed + added), so entity types with the most author engagement appear at top. Hovering shows exact counts. This is the primary visualization — gives an immediate visual sense of pipeline accuracy per entity type.

### 3b. Detailed Table — All Entity Types

A single table with all 5 entity types. Curator columns show values for genes/species and "—" for alleles/strains/transgenes:

| Entity | Papers | Extracted (TFP) | Author Confirmed | Author Removed | Author Added | Author Rate | Curator Curated | Curator Agrees w/ Author | Curator Agrees w/ Pipeline |
|--------|--------|-----------------|-----------------|----------------|-------------|-------------|-----------------|--------------------------|---------------------------|

Alleles, strains, and transgenes show "—" in the three curator columns, with a footnote: "Curator comparison pending ABC API integration."

**Data sources:**
- TFP: `tfp_genestudied`, `tfp_species`, `tfp_variation`, `tfp_strain`, `tfp_transgene`
- AFP: `afp_genestudied`, `afp_species`, `afp_variation`, `afp_strain`, `afp_transgene`
- Curator (genes & species only): `pap_gene`, `pap_species` — **filtered to manual curation only**

**Evidence code filtering for manual curation:**
- INCLUDE: `pap_evidence LIKE 'Curator_confirmed%'` or `pap_evidence LIKE 'Manually_connected%'`
- EXCLUDE: `Inferred_automatically "from author first pass%"` (author data)
- EXCLUDE: `Inferred_automatically` with script names (automated processing)
- EXCLUDE: `ACKnowledge_form`, `ACKnowledge_pipeline` (author/pipeline sources)
- EXCLUDE: NULL evidence (unknown origin)

**Agreement calculations** (at entity level per paper, then aggregated):
- Curator Agrees w/ Author = |curator_entities intersection AFP_entities| / |AFP_entities|
- Curator Agrees w/ Pipeline = |curator_entities intersection TFP_entities| / |TFP_entities|

### 3c. Manually Added Entities

Stats for free-text author additions from:
- `afp_othervariation` (new alleles)
- `afp_otherstrain` (new strains)
- `afp_othertransgene` (new transgenes)
- `afp_otherantibody` (new antibodies)
- `afp_otherspecies` (new species)

**Horizontal Bar Chart:** One bar per entity type showing total count of manually added entities, uniform color. Sorted descending by count. Consistent visual style with the chart above.

**Summary Table:**

| Entity Type | Papers with Additions | Total Added | Avg per Paper |
|-------------|----------------------|-------------|---------------|

Data is stored as JSON arrays in these tables. Parse and count entries.

### 3d. Confirmation Rate Trends

Existing line chart (entity confirmation rates over time by year/month) with curator agreement rate trend lines overlaid as dashed lines for genes and species.

---

## 4. Data Type Flags Tab

Same visual pattern as the Entities tab: bar chart → detail table → trend chart. Two sections for auto-detected and author-only data types, displayed adjacently.

### 4a. Auto-Detected Data Types (9 types)

Data types with automated prediction: Expression (`otherexpr`), Seq. change (`seqchange`), Genetic int. (`geneint`), Physical int. (`geneprod`), Regulatory int. (`genereg`), Allele phenotype (`newmutant`), RNAi phenotype (`rnai`), Overexpr. phenotype (`overexpr`), Enzymatic activity (`catalyticact`).

**Data layers:**
- Prediction: `cur_blackbox` view (combines `cur_nncdata` + `cur_svmdata`) or corresponding `tfp_*` tables
- Author response: `afp_*` tables (non-null/non-empty = positive)
- Curator validation: `cur_curdata` table

**Horizontal Stacked Bar Chart:**
One bar per auto-detected data type, segmented by color:
- **Green** — TP: Predicted positive, author confirmed (agreement)
- **Blue** — FN: Not predicted, author flagged positive (missed by prediction, added by author)
- **Pale red / light coral** — FP: Predicted positive, author did not confirm (false alarm, removed by author)
- **Gray** — TN: Not predicted, author did not flag (can be hidden via toggle since it dominates)

Bars sorted descending by **total author-positive** (TP + FN), so data types most frequently flagged by authors appear at top. Consistent color semantics with the entity chart: green = agreement, blue = author added, pale red = rejected/removed.

**Detail Table:**

| Data Type | Papers | TP | FP | FN | TN | Precision | Recall | Accuracy | Curator Validated | Curator Agrees w/ Author |
|-----------|--------|----|----|----|-----|-----------|--------|----------|-------------------|--------------------------|

- TP/FP/FN/TN: per paper, prediction positive vs author flagged positive
- Precision = TP / (TP + FP)
- Recall = TP / (TP + FN)
- Accuracy = (TP + TN) / total papers
- Curator Validated = papers where `cur_curdata` entry exists for this data type with positive/validated status
- Curator Agrees w/ Author = papers where both curator and author flagged positive / papers where either flagged positive

### 4b. Author-Only Data Types (8 types)

Data types without automated prediction: Gene model update (`structcorr`), Antibody (`antibody`), Site of action (`siteaction`), Time of action (`timeaction`), RNAseq (`rnaseq`), Chemical phenotype (`chemphen`), Environmental phenotype (`envpheno`), Disease (`humdis`).

**Horizontal Bar Chart:** One bar per data type showing count of papers flagged by authors, uniform color. Sorted descending by count. Consistent style with the charts above.

**Detail Table:**

| Data Type | Papers Flagged | % of Submissions | Curator Validated | Curator Agrees w/ Author |
|-----------|---------------|------------------|-------------------|--------------------------|

- Papers Flagged = count where `afp_*` is not null/empty (existing metric)
- % of Submissions = flagged / total submitted papers (afp_version = '2')
- Curator columns use same `cur_curdata` logic

### 4c. Prediction Accuracy Trends

Line chart showing prediction precision and recall over time for the 9 auto-detected data types, with year/month toggle. Binned by `afp_email.afp_timestamp`.

---

## 5. Contributors Tab

### 5a. Role Distribution Chart

Pie or bar chart showing submission counts by role at time of submission:
- **PI** — person exists in `two_pis` at time of submission
- **Postdoc** — `two_lineage.two_role = 'Postdoc'` with overlapping date range
- **PhD** — `two_lineage.two_role = 'Phd'` with overlapping date range
- **Masters** — `two_lineage.two_role = 'Masters'` with overlapping date range
- **Undergrad** — `two_lineage.two_role = 'Undergrad'` with overlapping date range
- **Other/Unknown** — no matching role found

**Role determination logic:**
For each submission (`afp_contributor` person_id + `afp_lasttouched` timestamp):
1. Check `two_pis` — if entry exists and predates submission, role = PI
2. Check `two_lineage` — find most specific role where `two_date1 <= submission_date <= two_date2` (or `two_date2 = 'present'`)
3. If no match, role = Other/Unknown

### 5b. Role Distribution Over Time

Stacked bar or area chart showing how the role mix changes over time (year/month toggle).

### 5c. Summary Stats Table

| Role | Submissions | % of Total | Unique People |
|------|-------------|------------|---------------|

---

## 6. Backend API Changes

### New Endpoints

| Endpoint | Purpose | Data Source |
|----------|---------|-------------|
| `/data_type_flags_confusion_matrix` | TP/FP/FN/TN + precision/recall/accuracy for 9 auto-detected flags | `cur_blackbox` + `afp_*` + `afp_version` |
| `/data_type_flags_curator_agreement` | Curator validation counts and agreement for all 17 flags | `cur_curdata` + `afp_*` |
| `/entity_curator_agreement` | Entity-level curator agreement for genes/species | `pap_gene`/`pap_species` (filtered by evidence) + `afp_*` + `tfp_*` |
| `/manually_added_entities_stats` | Counts of free-text entity additions | `afp_othervariation`, `afp_otherstrain`, `afp_othertransgene`, `afp_otherantibody`, `afp_otherspecies` |
| `/contributor_roles` | Submission counts by role at submission time | `afp_contributor` + `afp_lasttouched` + `two_pis` + `two_lineage` |
| `/contributor_roles_timeseries` | Role distribution over time | Same as above, binned by period |
| `/overall_agreement` | Macro-averaged agreement rates for overview cards | Aggregates from entity + flag endpoints |
| `/data_type_flags_accuracy_timeseries` | Prediction accuracy trends over time | `cur_blackbox` + `afp_*` + `afp_email` |

### Modified Endpoints

| Endpoint | Change |
|----------|--------|
| `/entity_confirmation_rates` | No changes needed |
| `/data_type_flags_stats` | Keep for backward compat, but new confusion matrix endpoint is preferred |
| `/confirmation_rates_timeseries` | Add optional parameter to include curator agreement trend data |

---

## 7. Frontend Component Changes

### New Components
- `UnifiedStatsPage.js` — tab container replacing separate pages
- `OverallAgreementCards.js` — three agreement rate cards for Overview tab
- `EntityBreakdownChart.js` — horizontal stacked bar chart for entity confirmation/added/removed
- `EntityDetailTable.js` — unified table with all 5 entity types + curator columns for genes/species
- `ManuallyAddedEntities.js` — bar chart + table for free-text entity additions
- `AutoDetectedFlagsChart.js` — horizontal stacked bar chart for TP/FP/FN/TN
- `AutoDetectedFlagsTable.js` — confusion matrix detail table with precision/recall/accuracy
- `AuthorOnlyFlagsChart.js` — horizontal bar chart for author-only flag counts
- `AuthorOnlyFlagsTable.js` — detail table for non-predicted flags with curator agreement
- `DataTypeFlagsAccuracyTrends.js` — prediction precision/recall trends chart
- `ContributorRoles.js` — role distribution chart
- `ContributorRolesTimeSeries.js` — role trends over time
- `ContributorRolesSummary.js` — summary stats table

### Modified Components
- `ConfirmationRateTrends.js` — add curator agreement dashed lines overlay
- `TimeToSubmitChart.js` — remove secondary submissions column series and right y-axis

### Removed/Deprecated
- `ConfirmationRateCards.js` — replaced by `EntityBreakdownChart.js` + `EntityDetailTable.js`
- `DataTypeFlagsChart.js` — replaced by `AutoDetectedFlagsChart.js` + `AuthorOnlyFlagsChart.js`
- Separate `Statistics.js` page (merged into unified page)
- Separate `PaperStats.js` page (merged into unified page)

---

## 8. Data Source Summary

| Data | Table(s) | DB |
|------|----------|----|
| Pipeline-extracted entities | `tfp_genestudied`, `tfp_species`, `tfp_variation`, `tfp_strain`, `tfp_transgene` | Same postgres DB |
| Author-submitted entities | `afp_genestudied`, `afp_species`, `afp_variation`, `afp_strain`, `afp_transgene` | Same postgres DB |
| Author data type flags | `afp_otherexpr`, `afp_seqchange`, `afp_geneint`, `afp_geneprod`, `afp_genereg`, `afp_newmutant`, `afp_rnai`, `afp_overexpr`, `afp_catalyticact`, `afp_structcorr`, `afp_antibody`, `afp_siteaction`, `afp_timeaction`, `afp_rnaseq`, `afp_chemphen`, `afp_envpheno`, `afp_humdis` | Same postgres DB |
| Author free-text entities | `afp_othervariation`, `afp_otherstrain`, `afp_othertransgene`, `afp_otherantibody`, `afp_otherspecies` | Same postgres DB |
| Automated predictions | `cur_blackbox` view (`cur_nncdata` + `cur_svmdata`) | Same postgres DB |
| Curator validation (data types) | `cur_curdata` | Same postgres DB |
| Curator curated entities (genes) | `pap_gene` filtered by `pap_evidence LIKE 'Curator_confirmed%'` or `LIKE 'Manually_connected%'` | Same postgres DB |
| Curator curated entities (species) | `pap_species` filtered same as above | Same postgres DB |
| Curator curated entities (alleles, strains, transgenes) | Not available locally | ABC API (future) |
| Submission metadata | `afp_version`, `afp_lasttouched`, `afp_email`, `afp_contributor` | Same postgres DB |
| Person roles | `two_pis`, `two_lineage` | Same postgres DB |

---

## 9. Out of Scope

- PDF certificate generation (separate ticket)
- ABC API integration for allele/strain/transgene curator data (future enhancement)
- GAF file parsing for GO-specific curator comparison (can be added later, gene-level curator data from `pap_gene` covers the immediate need)
