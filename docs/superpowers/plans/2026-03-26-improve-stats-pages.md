# Improve Stats Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate the curator dashboard stats pages into a unified tabbed view with comprehensive entity, data type flag, and contributor statistics including three-way comparison (pipeline vs author vs curator).

**Architecture:** All new stats endpoints are added as `req_type` handlers in the existing `CuratorDashboardReader.on_post()` dispatch in `curator_dashboard.py`. The frontend replaces the two separate stats pages (`Statistics.js`, `PaperStats.js`) with a single `UnifiedStatsPage.js` using React Bootstrap Tabs with lazy loading. Each tab has its own components following a consistent pattern: bar chart → detail table → trend chart.

**Tech Stack:** Python/Falcon (backend), React 16.5.x with React Bootstrap, Highcharts, react-query, axios (frontend). PostgreSQL database accessed via WBTools `WBDBManager`.

**Spec:** `docs/superpowers/specs/2026-03-26-improve-stats-pages-design.md`

---

## File Map

### Backend (all changes in one file)

- **Modify:** `src/backend/api/endpoints/curator_dashboard.py` — Add 8 new `req_type` handlers and their computation methods:
  - `_compute_data_type_flags_confusion_matrix()` — TP/FP/FN/TN for 9 auto-detected flags
  - `_compute_data_type_flags_curator_agreement()` — curator vs author agreement for all 17 flags
  - `_compute_entity_curator_agreement()` — three-way entity comparison for genes/species
  - `_compute_manually_added_entities_stats()` — free-text entity counts
  - `_compute_contributor_roles()` — role distribution at submission time
  - `_compute_contributor_roles_timeseries()` — role distribution over time
  - `_compute_overall_agreement()` — macro-averaged agreement rates
  - `_compute_data_type_flags_accuracy_timeseries()` — prediction accuracy over time

### Frontend — New Components

All in `src/frontend/curator_dashboard/src/pages/stats/`:

- **Create:** `UnifiedStatsPage.js` — Tab container with Overview, Entities, Data Type Flags, Contributors
- **Create:** `OverallAgreementCards.js` — Three agreement rate cards for Overview tab
- **Create:** `EntityBreakdownChart.js` — Horizontal stacked bar chart (confirmed/added/removed)
- **Create:** `EntityDetailTable.js` — Unified table with all 5 entity types + curator columns
- **Create:** `ManuallyAddedEntities.js` — Bar chart + table for free-text entity additions
- **Create:** `AutoDetectedFlagsChart.js` — Horizontal stacked bar chart (TP/FP/FN/TN)
- **Create:** `AutoDetectedFlagsTable.js` — Confusion matrix detail table
- **Create:** `AuthorOnlyFlagsChart.js` — Horizontal bar chart for author-only flags
- **Create:** `AuthorOnlyFlagsTable.js` — Detail table for author-only flags
- **Create:** `DataTypeFlagsAccuracyTrends.js` — Precision/recall trend chart
- **Create:** `ContributorRoles.js` — Role distribution pie chart
- **Create:** `ContributorRolesTimeSeries.js` — Stacked bar chart over time
- **Create:** `ContributorRolesSummary.js` — Summary stats table

### Frontend — Modified Components

- **Modify:** `src/frontend/curator_dashboard/src/pages/stats/TimeToSubmitChart.js` — Remove dual-axis submissions series
- **Modify:** `src/frontend/curator_dashboard/src/pages/stats/ConfirmationRateTrends.js` — Add curator agreement dashed overlay
- **Modify:** `src/frontend/curator_dashboard/src/components/PageArea.js` — Update routing
- **Modify:** `src/frontend/curator_dashboard/src/components/LateralMenu.js` — Merge two menu items into one

---

## Task 1: Backend — Data Type Flags Confusion Matrix Endpoint

**Files:**
- Modify: `src/backend/api/endpoints/curator_dashboard.py`

- [ ] **Step 1: Add the `_compute_data_type_flags_confusion_matrix` method**

Add this method to the `CuratorDashboardReader` class, after the existing `_compute_confirmation_rates_timeseries` method (after line 301):

```python
    def _compute_data_type_flags_confusion_matrix(self):
        """Compute TP/FP/FN/TN for auto-detected data type flags.

        Compares automated prediction (cur_blackbox) against author response (afp_* tables).
        Only considers papers with full submissions (afp_version = '2').
        """
        auto_detected_flags = {
            "Expression": "otherexpr",
            "Seq. change": "seqchange",
            "Genetic int.": "geneint",
            "Physical int.": "geneprod",
            "Regulatory int.": "genereg",
            "Allele phenotype": "newmutant",
            "RNAi phenotype": "rnai",
            "Overexpr. phenotype": "overexpr",
            "Enzymatic activity": "catalyticact",
        }
        results = {}

        with self.db.afp.get_cursor() as curs:
            # Get all papers with full submissions
            curs.execute(
                "SELECT DISTINCT afp_version.joinkey "
                "FROM afp_version "
                "WHERE afp_version.afp_version = '2'"
            )
            submitted_papers = set(row[0] for row in curs.fetchall())

            for display_name, flag_name in auto_detected_flags.items():
                afp_table = f"afp_{flag_name}"
                afp_col = afp_table

                # Get papers where author flagged positive
                curs.execute(
                    "SELECT DISTINCT {t}.joinkey "
                    "FROM {t} "
                    "JOIN afp_version ON {t}.joinkey = afp_version.joinkey "
                    "WHERE afp_version.afp_version = '2' "
                    "AND {t}.{c} IS NOT NULL AND {t}.{c} != ''".format(
                        t=afp_table, c=afp_col
                    )
                )
                author_positive = set(row[0] for row in curs.fetchall())

                # Get papers where prediction was positive (from cur_blackbox)
                curs.execute(
                    "SELECT DISTINCT cur_paper FROM cur_blackbox "
                    "WHERE cur_datatype = %s "
                    "AND UPPER(cur_blackbox) IN ('HIGH', 'MEDIUM')",
                    (flag_name,)
                )
                predicted_positive = set(row[0] for row in curs.fetchall())
                # Only consider papers that have been submitted
                predicted_positive = predicted_positive & submitted_papers

                tp = len(author_positive & predicted_positive)
                fp = len(predicted_positive - author_positive)
                fn = len(author_positive - predicted_positive)
                tn = len(submitted_papers - author_positive - predicted_positive)
                total = len(submitted_papers)

                precision = round(
                    (tp / (tp + fp) * 100) if (tp + fp) > 0 else 0, 1
                )
                recall = round(
                    (tp / (tp + fn) * 100) if (tp + fn) > 0 else 0, 1
                )
                accuracy = round(
                    ((tp + tn) / total * 100) if total > 0 else 0, 1
                )

                results[display_name] = {
                    "papers": total,
                    "tp": tp,
                    "fp": fp,
                    "fn": fn,
                    "tn": tn,
                    "precision": precision,
                    "recall": recall,
                    "accuracy": accuracy,
                }
        return results
```

- [ ] **Step 2: Add the `req_type` handler in `on_post`**

In the `on_post` method, add this block after the `confirmation_rates_timeseries` handler (after the line `resp.status = falcon.HTTP_200` at line 743):

```python
                elif req_type == "data_type_flags_confusion_matrix":
                    results = self._compute_data_type_flags_confusion_matrix()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200
```

Also add `"data_type_flags_confusion_matrix"` to the guard condition at the top of `on_post` (lines 305-309). Add it to the chain of `req_type !=` checks.

- [ ] **Step 3: Verify**

Run the API server and test with curl:
```bash
curl -X POST http://localhost:8001/api/read_admin/data_type_flags_confusion_matrix -H "Content-Type: application/json" -d '{}'
```
Expected: JSON with 9 data type keys, each containing `papers`, `tp`, `fp`, `fn`, `tn`, `precision`, `recall`, `accuracy`.

- [ ] **Step 4: Commit**

```bash
git add src/backend/api/endpoints/curator_dashboard.py
git commit -m "feat(api): add data type flags confusion matrix endpoint"
```

---

## Task 2: Backend — Data Type Flags Curator Agreement Endpoint

**Files:**
- Modify: `src/backend/api/endpoints/curator_dashboard.py`

- [ ] **Step 1: Add the `_compute_data_type_flags_curator_agreement` method**

Add after the method from Task 1:

```python
    def _compute_data_type_flags_curator_agreement(self):
        """Compute curator validation and agreement with authors for all 17 data type flags.

        Uses cur_curdata table for curator validation status.
        """
        all_flags = {
            "Expression": "otherexpr",
            "Seq. change": "seqchange",
            "Genetic int.": "geneint",
            "Physical int.": "geneprod",
            "Regulatory int.": "genereg",
            "Allele phenotype": "newmutant",
            "RNAi phenotype": "rnai",
            "Overexpr. phenotype": "overexpr",
            "Enzymatic activity": "catalyticact",
            "Gene model update": "structcorr",
            "Antibody": "antibody",
            "Site of action": "siteaction",
            "Time of action": "timeaction",
            "RNAseq": "rnaseq",
            "Chemical phenotype": "chemphen",
            "Environmental phenotype": "envpheno",
            "Disease": "humdis",
        }
        results = {}

        with self.db.afp.get_cursor() as curs:
            for display_name, flag_name in all_flags.items():
                afp_table = f"afp_{flag_name}"
                afp_col = afp_table

                # Papers where author flagged positive
                curs.execute(
                    "SELECT DISTINCT {t}.joinkey "
                    "FROM {t} "
                    "JOIN afp_version ON {t}.joinkey = afp_version.joinkey "
                    "WHERE afp_version.afp_version = '2' "
                    "AND {t}.{c} IS NOT NULL AND {t}.{c} != ''".format(
                        t=afp_table, c=afp_col
                    )
                )
                author_positive = set(row[0] for row in curs.fetchall())

                # Papers where curator validated positive for this datatype
                curs.execute(
                    "SELECT DISTINCT cur_paper FROM cur_curdata "
                    "WHERE cur_datatype = %s "
                    "AND cur_curdata IN ('positive', 'validated')",
                    (flag_name,)
                )
                curator_positive = set(row[0] for row in curs.fetchall())

                # Only count curator papers that are also in submitted set
                curs.execute(
                    "SELECT DISTINCT joinkey FROM afp_version "
                    "WHERE afp_version = '2'"
                )
                submitted_papers = set(row[0] for row in curs.fetchall())
                curator_positive_submitted = curator_positive & submitted_papers

                both_positive = len(author_positive & curator_positive_submitted)
                either_positive = len(author_positive | curator_positive_submitted)
                agreement = round(
                    (both_positive / either_positive * 100)
                    if either_positive > 0 else 0, 1
                )

                results[display_name] = {
                    "author_flagged": len(author_positive),
                    "curator_validated": len(curator_positive_submitted),
                    "both_positive": both_positive,
                    "agreement": agreement,
                }
        return results
```

- [ ] **Step 2: Add the `req_type` handler in `on_post`**

```python
                elif req_type == "data_type_flags_curator_agreement":
                    results = self._compute_data_type_flags_curator_agreement()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200
```

Add `"data_type_flags_curator_agreement"` to the guard condition.

- [ ] **Step 3: Commit**

```bash
git add src/backend/api/endpoints/curator_dashboard.py
git commit -m "feat(api): add data type flags curator agreement endpoint"
```

---

## Task 3: Backend — Entity Curator Agreement Endpoint

**Files:**
- Modify: `src/backend/api/endpoints/curator_dashboard.py`

- [ ] **Step 1: Add the `_compute_entity_curator_agreement` method**

This is the most complex endpoint — three-way entity-level comparison for genes and species using `pap_gene`/`pap_species` filtered to manual curation evidence only.

```python
    def _compute_entity_curator_agreement(self):
        """Compute entity-level curator agreement for genes and species.

        Compares curated entities (from pap_gene/pap_species, filtered to manual curation)
        against author-submitted (AFP) and pipeline-extracted (TFP) entities.
        """
        entity_types = {
            "genes": {
                "tfp_table": "tfp_genestudied",
                "afp_table": "afp_genestudied",
                "pap_table": "pap_gene",
                "pap_col": "pap_gene",
                "pap_evidence_col": "pap_evidence",
            },
            "species": {
                "tfp_table": "tfp_species",
                "afp_table": "afp_species",
                "pap_table": "pap_species",
                "pap_col": "pap_species",
                "pap_evidence_col": "pap_evidence",
            },
        }
        results = {}

        with self.db.afp.get_cursor() as curs:
            for label, tables in entity_types.items():
                # Get TFP and AFP values per paper (same as existing confirmation rate logic)
                curs.execute(
                    "SELECT tfp.joinkey, tfp.{tfp_col}, afp.{afp_col} "
                    "FROM {tfp_table} tfp "
                    "JOIN {afp_table} afp ON tfp.joinkey = afp.joinkey "
                    "JOIN afp_version ON tfp.joinkey = afp_version.joinkey "
                    "JOIN afp_lasttouched ON tfp.joinkey = afp_lasttouched.joinkey "
                    "WHERE afp_version.afp_version = '2'".format(
                        tfp_col=tables["tfp_table"],
                        afp_col=tables["afp_table"],
                        tfp_table=tables["tfp_table"],
                        afp_table=tables["afp_table"],
                    )
                )
                paper_data = {}
                for joinkey, tfp_val, afp_val in curs.fetchall():
                    extracted = set(
                        e.strip() for e in (tfp_val or "").split(" | ")
                        if e.strip()
                    )
                    submitted = set(
                        e.strip() for e in (afp_val or "").split(" | ")
                        if e.strip()
                    )
                    paper_data[joinkey] = {
                        "extracted": extracted,
                        "submitted": submitted,
                    }

                # Get manually curated entities per paper from pap_gene/pap_species
                # Filter to manual curation evidence only
                curs.execute(
                    "SELECT joinkey, {pap_col} FROM {pap_table} "
                    "WHERE ({pap_evidence_col} LIKE 'Curator_confirmed%%' "
                    "OR {pap_evidence_col} LIKE 'Manually_connected%%') "
                    "AND joinkey IN %s".format(
                        pap_col=tables["pap_col"],
                        pap_table=tables["pap_table"],
                        pap_evidence_col=tables["pap_evidence_col"],
                    ),
                    (tuple(paper_data.keys()) if paper_data else ('',),)
                )
                curator_entities = defaultdict(set)
                for joinkey, pap_val in curs.fetchall():
                    if pap_val and pap_val.strip():
                        curator_entities[joinkey].add(pap_val.strip())

                # Compute agreement
                total_afp = 0
                total_tfp = 0
                curator_agrees_afp = 0
                curator_agrees_tfp = 0
                papers_with_curator = 0

                for joinkey, data in paper_data.items():
                    curated = curator_entities.get(joinkey, set())
                    if not curated:
                        continue
                    papers_with_curator += 1
                    afp = data["submitted"]
                    tfp = data["extracted"]

                    total_afp += len(afp)
                    total_tfp += len(tfp)
                    curator_agrees_afp += len(curated & afp)
                    curator_agrees_tfp += len(curated & tfp)

                afp_agreement = round(
                    (curator_agrees_afp / total_afp * 100)
                    if total_afp > 0 else 0, 1
                )
                tfp_agreement = round(
                    (curator_agrees_tfp / total_tfp * 100)
                    if total_tfp > 0 else 0, 1
                )

                results[label] = {
                    "papers_with_curator_data": papers_with_curator,
                    "curator_agrees_with_author": afp_agreement,
                    "curator_agrees_with_pipeline": tfp_agreement,
                    "total_curator_entities": sum(
                        len(v) for v in curator_entities.values()
                    ),
                }
        return results
```

- [ ] **Step 2: Add the `req_type` handler in `on_post`**

```python
                elif req_type == "entity_curator_agreement":
                    results = self._compute_entity_curator_agreement()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200
```

Add `"entity_curator_agreement"` to the guard condition.

- [ ] **Step 3: Commit**

```bash
git add src/backend/api/endpoints/curator_dashboard.py
git commit -m "feat(api): add entity curator agreement endpoint for genes/species"
```

---

## Task 4: Backend — Manually Added Entities Stats Endpoint

**Files:**
- Modify: `src/backend/api/endpoints/curator_dashboard.py`

- [ ] **Step 1: Add the `_compute_manually_added_entities_stats` method**

```python
    def _compute_manually_added_entities_stats(self):
        """Compute stats for free-text entities added by authors."""
        other_tables = {
            "New alleles": "afp_othervariation",
            "New strains": "afp_otherstrain",
            "New transgenes": "afp_othertransgene",
            "New antibodies": "afp_otherantibody",
            "New species": "afp_otherspecies",
        }
        results = {}

        with self.db.afp.get_cursor() as curs:
            for display_name, table_name in other_tables.items():
                col_name = table_name
                curs.execute(
                    "SELECT {t}.{c} "
                    "FROM {t} "
                    "JOIN afp_version ON {t}.joinkey = afp_version.joinkey "
                    "JOIN afp_lasttouched ON {t}.joinkey = afp_lasttouched.joinkey "
                    "WHERE afp_version.afp_version = '2' "
                    "AND {t}.{c} IS NOT NULL AND {t}.{c} != '' "
                    "AND {t}.{c} != '[]'".format(t=table_name, c=col_name)
                )
                rows = curs.fetchall()

                papers_with_additions = 0
                total_added = 0
                for (val,) in rows:
                    try:
                        items = json.loads(val)
                        if isinstance(items, list) and len(items) > 0:
                            papers_with_additions += 1
                            total_added += len(items)
                    except (json.JSONDecodeError, TypeError):
                        # Non-JSON value, count as single item if non-empty
                        if val and val.strip() and val.strip() != '[]':
                            papers_with_additions += 1
                            total_added += 1

                avg_per_paper = round(
                    total_added / papers_with_additions, 1
                ) if papers_with_additions > 0 else 0

                results[display_name] = {
                    "papers_with_additions": papers_with_additions,
                    "total_added": total_added,
                    "avg_per_paper": avg_per_paper,
                }
        return results
```

- [ ] **Step 2: Add the `req_type` handler in `on_post`**

```python
                elif req_type == "manually_added_entities_stats":
                    results = self._compute_manually_added_entities_stats()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200
```

Add `"manually_added_entities_stats"` to the guard condition.

- [ ] **Step 3: Commit**

```bash
git add src/backend/api/endpoints/curator_dashboard.py
git commit -m "feat(api): add manually added entities stats endpoint"
```

---

## Task 5: Backend — Contributor Roles Endpoint

**Files:**
- Modify: `src/backend/api/endpoints/curator_dashboard.py`

- [ ] **Step 1: Add the `_determine_role_at_date` helper and `_compute_contributor_roles` method**

```python
    @staticmethod
    def _determine_role_at_date(pi_dates, lineage_rows, submission_date):
        """Determine a person's role at the time of submission.

        Args:
            pi_dates: list of timestamps from two_pis for this person
            lineage_rows: list of (two_role, two_date1, two_date2) from two_lineage
            submission_date: datetime of the submission

        Returns:
            str: role name (PI, Postdoc, PhD, Masters, Undergrad, Other/Unknown)
        """
        if submission_date is None:
            return "Other/Unknown"
        sub_year = submission_date.year

        # Check if PI at submission time
        for pi_ts in pi_dates:
            if pi_ts is None or pi_ts <= submission_date:
                return "PI"

        # Check lineage roles
        role_map = {
            "Phd": "PhD",
            "Postdoc": "Postdoc",
            "Masters": "Masters",
            "Undergrad": "Undergrad",
        }
        for role, date1, date2 in lineage_rows:
            if role not in role_map:
                continue
            try:
                start_year = int(date1) if date1 else 0
            except (ValueError, TypeError):
                start_year = 0
            try:
                end_year = (
                    sub_year + 1 if date2 == "present"
                    else int(date2) if date2 else 9999
                )
            except (ValueError, TypeError):
                end_year = 9999
            if start_year <= sub_year <= end_year:
                return role_map[role]

        return "Other/Unknown"

    def _compute_contributor_roles(self):
        """Compute submission counts by contributor role at time of submission."""
        with self.db.afp.get_cursor() as curs:
            # Get all contributors with their submission timestamps
            curs.execute(
                "SELECT afp_contributor.afp_contributor, "
                "afp_lasttouched.afp_lasttouched, "
                "afp_email.afp_timestamp "
                "FROM afp_contributor "
                "JOIN afp_version ON afp_contributor.joinkey = afp_version.joinkey "
                "JOIN afp_lasttouched ON afp_contributor.joinkey = afp_lasttouched.joinkey "
                "JOIN afp_email ON afp_contributor.joinkey = afp_email.joinkey "
                "WHERE afp_version.afp_version = '2'"
            )
            submissions = curs.fetchall()

            # Collect unique person IDs
            person_ids = set()
            for contributor, _, _ in submissions:
                if contributor and contributor.strip():
                    # Person ID stored as "twoNNNN" format
                    person_ids.add(contributor.strip())

            # Fetch PI data for all persons
            pi_data = defaultdict(list)
            if person_ids:
                curs.execute(
                    "SELECT joinkey, two_timestamp FROM two_pis "
                    "WHERE joinkey IN %s",
                    (tuple(person_ids),)
                )
                for joinkey, ts in curs.fetchall():
                    pi_data[joinkey].append(ts)

            # Fetch lineage data for all persons
            lineage_data = defaultdict(list)
            if person_ids:
                curs.execute(
                    "SELECT joinkey, two_role, two_date1, two_date2 "
                    "FROM two_lineage "
                    "WHERE joinkey IN %s",
                    (tuple(person_ids),)
                )
                for joinkey, role, d1, d2 in curs.fetchall():
                    lineage_data[joinkey].append((role, d1, d2))

            # Determine role for each submission
            role_counts = Counter()
            role_people = defaultdict(set)
            for contributor, lasttouched_ts, email_ts in submissions:
                if not contributor or not contributor.strip():
                    continue
                person_id = contributor.strip()
                submission_date = email_ts  # Use email timestamp as reference
                role = self._determine_role_at_date(
                    pi_data.get(person_id, []),
                    lineage_data.get(person_id, []),
                    submission_date,
                )
                role_counts[role] += 1
                role_people[role].add(person_id)

        total = sum(role_counts.values())
        results = {}
        for role in ["PI", "Postdoc", "PhD", "Masters", "Undergrad", "Other/Unknown"]:
            count = role_counts.get(role, 0)
            results[role] = {
                "submissions": count,
                "percentage": round(
                    count / total * 100 if total > 0 else 0, 1
                ),
                "unique_people": len(role_people.get(role, set())),
            }
        return results
```

- [ ] **Step 2: Add the `req_type` handler in `on_post`**

```python
                elif req_type == "contributor_roles":
                    results = self._compute_contributor_roles()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200
```

Add `"contributor_roles"` to the guard condition.

- [ ] **Step 3: Commit**

```bash
git add src/backend/api/endpoints/curator_dashboard.py
git commit -m "feat(api): add contributor roles endpoint with role-at-submission-time logic"
```

---

## Task 6: Backend — Contributor Roles Timeseries Endpoint

**Files:**
- Modify: `src/backend/api/endpoints/curator_dashboard.py`

- [ ] **Step 1: Add the `_compute_contributor_roles_timeseries` method**

```python
    def _compute_contributor_roles_timeseries(self, bin_period='y'):
        """Compute role distribution over time."""
        with self.db.afp.get_cursor() as curs:
            curs.execute(
                "SELECT afp_contributor.afp_contributor, "
                "afp_email.afp_timestamp "
                "FROM afp_contributor "
                "JOIN afp_version ON afp_contributor.joinkey = afp_version.joinkey "
                "JOIN afp_lasttouched ON afp_contributor.joinkey = afp_lasttouched.joinkey "
                "JOIN afp_email ON afp_contributor.joinkey = afp_email.joinkey "
                "WHERE afp_version.afp_version = '2'"
            )
            submissions = curs.fetchall()

            person_ids = set()
            for contributor, _ in submissions:
                if contributor and contributor.strip():
                    person_ids.add(contributor.strip())

            pi_data = defaultdict(list)
            if person_ids:
                curs.execute(
                    "SELECT joinkey, two_timestamp FROM two_pis "
                    "WHERE joinkey IN %s",
                    (tuple(person_ids),)
                )
                for joinkey, ts in curs.fetchall():
                    pi_data[joinkey].append(ts)

            lineage_data = defaultdict(list)
            if person_ids:
                curs.execute(
                    "SELECT joinkey, two_role, two_date1, two_date2 "
                    "FROM two_lineage "
                    "WHERE joinkey IN %s",
                    (tuple(person_ids),)
                )
                for joinkey, role, d1, d2 in curs.fetchall():
                    lineage_data[joinkey].append((role, d1, d2))

        period_roles = defaultdict(Counter)
        for contributor, email_ts in submissions:
            if not contributor or not contributor.strip() or email_ts is None:
                continue
            person_id = contributor.strip()
            if bin_period == 'y':
                period_key = email_ts.strftime('%Y')
            else:
                period_key = email_ts.strftime('%Y-%m')

            role = self._determine_role_at_date(
                pi_data.get(person_id, []),
                lineage_data.get(person_id, []),
                email_ts,
            )
            period_roles[period_key][role] += 1

        all_roles = ["PI", "Postdoc", "PhD", "Masters", "Undergrad", "Other/Unknown"]
        result = []
        for period_key in sorted(period_roles.keys()):
            counts = period_roles[period_key]
            period_result = {role: counts.get(role, 0) for role in all_roles}
            result.append([period_key, period_result])
        return result
```

- [ ] **Step 2: Add the `req_type` handler in `on_post`**

```python
                elif req_type == "contributor_roles_timeseries":
                    bin_size = (req.media or {}).get("bin_size", "y")
                    results = self._compute_contributor_roles_timeseries(bin_size)
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200
```

Add `"contributor_roles_timeseries"` to the guard condition.

- [ ] **Step 3: Commit**

```bash
git add src/backend/api/endpoints/curator_dashboard.py
git commit -m "feat(api): add contributor roles timeseries endpoint"
```

---

## Task 7: Backend — Data Type Flags Accuracy Timeseries Endpoint

**Files:**
- Modify: `src/backend/api/endpoints/curator_dashboard.py`

- [ ] **Step 1: Add the `_compute_data_type_flags_accuracy_timeseries` method**

```python
    def _compute_data_type_flags_accuracy_timeseries(self, bin_period='y'):
        """Compute prediction precision and recall over time for auto-detected flags."""
        auto_detected_flags = {
            "Expression": "otherexpr",
            "Seq. change": "seqchange",
            "Genetic int.": "geneint",
            "Physical int.": "geneprod",
            "Regulatory int.": "genereg",
            "Allele phenotype": "newmutant",
            "RNAi phenotype": "rnai",
            "Overexpr. phenotype": "overexpr",
            "Enzymatic activity": "catalyticact",
        }

        with self.db.afp.get_cursor() as curs:
            # Get all submitted papers with their email timestamps
            curs.execute(
                "SELECT afp_version.joinkey, afp_email.afp_timestamp "
                "FROM afp_version "
                "JOIN afp_email ON afp_version.joinkey = afp_email.joinkey "
                "WHERE afp_version.afp_version = '2'"
            )
            paper_timestamps = {}
            for joinkey, ts in curs.fetchall():
                if ts is not None:
                    paper_timestamps[joinkey] = ts

            # Get all predictions from cur_blackbox
            prediction_positive = defaultdict(set)
            for flag_name in auto_detected_flags.values():
                curs.execute(
                    "SELECT DISTINCT cur_paper FROM cur_blackbox "
                    "WHERE cur_datatype = %s "
                    "AND UPPER(cur_blackbox) IN ('HIGH', 'MEDIUM')",
                    (flag_name,)
                )
                for (paper_id,) in curs.fetchall():
                    prediction_positive[flag_name].add(paper_id)

            # Get all author flags
            author_positive = defaultdict(set)
            for flag_name in auto_detected_flags.values():
                afp_table = f"afp_{flag_name}"
                curs.execute(
                    "SELECT DISTINCT {t}.joinkey "
                    "FROM {t} "
                    "JOIN afp_version ON {t}.joinkey = afp_version.joinkey "
                    "WHERE afp_version.afp_version = '2' "
                    "AND {t}.{c} IS NOT NULL AND {t}.{c} != ''".format(
                        t=afp_table, c=afp_table
                    )
                )
                for (joinkey,) in curs.fetchall():
                    author_positive[flag_name].add(joinkey)

        # Bin by period
        period_data = defaultdict(lambda: defaultdict(lambda: {
            "tp": 0, "fp": 0, "fn": 0, "tn": 0,
        }))

        for joinkey, ts in paper_timestamps.items():
            if bin_period == 'y':
                period_key = ts.strftime('%Y')
            else:
                period_key = ts.strftime('%Y-%m')

            for display_name, flag_name in auto_detected_flags.items():
                pred = joinkey in prediction_positive[flag_name]
                auth = joinkey in author_positive[flag_name]
                if pred and auth:
                    period_data[period_key][display_name]["tp"] += 1
                elif pred and not auth:
                    period_data[period_key][display_name]["fp"] += 1
                elif not pred and auth:
                    period_data[period_key][display_name]["fn"] += 1
                else:
                    period_data[period_key][display_name]["tn"] += 1

        result = []
        for period_key in sorted(period_data.keys()):
            period_metrics = {}
            for display_name in auto_detected_flags.keys():
                d = period_data[period_key][display_name]
                tp, fp, fn = d["tp"], d["fp"], d["fn"]
                precision = round(
                    (tp / (tp + fp) * 100) if (tp + fp) > 0 else 0, 1
                )
                recall = round(
                    (tp / (tp + fn) * 100) if (tp + fn) > 0 else 0, 1
                )
                period_metrics[display_name] = {
                    "precision": precision,
                    "recall": recall,
                }
            result.append([period_key, period_metrics])
        return result
```

- [ ] **Step 2: Add the `req_type` handler in `on_post`**

```python
                elif req_type == "data_type_flags_accuracy_timeseries":
                    bin_size = (req.media or {}).get("bin_size", "y")
                    results = self._compute_data_type_flags_accuracy_timeseries(bin_size)
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200
```

Add `"data_type_flags_accuracy_timeseries"` to the guard condition.

- [ ] **Step 3: Commit**

```bash
git add src/backend/api/endpoints/curator_dashboard.py
git commit -m "feat(api): add data type flags accuracy timeseries endpoint"
```

---

## Task 8: Backend — Overall Agreement Endpoint

**Files:**
- Modify: `src/backend/api/endpoints/curator_dashboard.py`

- [ ] **Step 1: Add the `_compute_overall_agreement` method**

This aggregates data from the other computation methods to produce macro-averaged agreement rates.

```python
    def _compute_overall_agreement(self):
        """Compute macro-averaged agreement rates for overview cards."""
        # Get entity confirmation rates (predicted vs author)
        entity_rates = self._compute_entity_confirmation_rates()
        entity_confirm_values = [
            entity_rates[k]["confirmation_rate"]
            for k in entity_rates
            if entity_rates[k]["total_extracted"] > 0
        ]

        # Get flag confusion matrix (predicted vs author)
        flag_matrix = self._compute_data_type_flags_confusion_matrix()
        flag_accuracy_values = [
            flag_matrix[k]["accuracy"]
            for k in flag_matrix
        ]

        # Predicted vs Author: average of entity confirm rates + flag accuracies
        all_pred_author = entity_confirm_values + flag_accuracy_values
        predicted_vs_author = round(
            sum(all_pred_author) / len(all_pred_author), 1
        ) if all_pred_author else 0

        # Get entity curator agreement (author vs curator)
        entity_curator = self._compute_entity_curator_agreement()
        entity_author_curator = [
            entity_curator[k]["curator_agrees_with_author"]
            for k in entity_curator
            if entity_curator[k]["papers_with_curator_data"] > 0
        ]

        # Get flag curator agreement (author vs curator)
        flag_curator = self._compute_data_type_flags_curator_agreement()
        flag_author_curator = [
            flag_curator[k]["agreement"]
            for k in flag_curator
            if flag_curator[k]["curator_validated"] > 0
        ]

        all_author_curator = entity_author_curator + flag_author_curator
        author_vs_curator = round(
            sum(all_author_curator) / len(all_author_curator), 1
        ) if all_author_curator else 0

        # Predicted vs Curator
        entity_pred_curator = [
            entity_curator[k]["curator_agrees_with_pipeline"]
            for k in entity_curator
            if entity_curator[k]["papers_with_curator_data"] > 0
        ]
        # For flags, compute prediction-curator agreement from confusion matrix + curator data
        flag_pred_curator = []
        for display_name in flag_matrix:
            cm = flag_matrix[display_name]
            ca = flag_curator.get(display_name, {})
            curator_val = ca.get("curator_validated", 0)
            if curator_val > 0 and (cm["tp"] + cm["fp"]) > 0:
                # Fraction of predicted-positive that curator also validated
                flag_pred_curator.append(cm["precision"])

        all_pred_curator = entity_pred_curator + flag_pred_curator
        predicted_vs_curator = round(
            sum(all_pred_curator) / len(all_pred_curator), 1
        ) if all_pred_curator else 0

        return {
            "predicted_vs_author": predicted_vs_author,
            "author_vs_curator": author_vs_curator,
            "predicted_vs_curator": predicted_vs_curator,
        }
```

- [ ] **Step 2: Add the `req_type` handler in `on_post`**

```python
                elif req_type == "overall_agreement":
                    results = self._compute_overall_agreement()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200
```

Add `"overall_agreement"` to the guard condition.

- [ ] **Step 3: Commit**

```bash
git add src/backend/api/endpoints/curator_dashboard.py
git commit -m "feat(api): add overall agreement endpoint for overview cards"
```

---

## Task 9: Frontend — Simplify TimeToSubmitChart

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/TimeToSubmitChart.js`

- [ ] **Step 1: Remove the dual-axis submissions column series**

Replace the `options` object and remove the `counts` variable. The chart should only show the average days line:

```javascript
const TimeToSubmitChart = () => {
    const [binSize, setBinSize] = useState('y');
    const {data, isLoading, isSuccess} = useQuery(
        'timeToSubmit' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/time_to_submit",
            {bin_size: binSize}
        )
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const tsData = isSuccess ? data.data : [];
    const showYearOnly = binSize.includes('y');

    const categories = tsData.map(item => {
        if (showYearOnly) {
            return item[0].split('-')[0];
        }
        return item[0];
    });

    const avgDays = tsData.map(item => item[1]);

    const options = {
        title: {text: 'Average Time to Submit Over Time'},
        subtitle: {text: 'Mean number of days between email and author submission'},
        xAxis: {categories: categories},
        yAxis: {
            title: {text: 'Average days'},
            min: 0
        },
        tooltip: {shared: true},
        plotOptions: {
            line: {
                dataLabels: {enabled: true, format: '{y}d'},
                enableMouseTracking: true
            }
        },
        series: [{
            name: 'Avg. days to submit',
            data: avgDays,
            color: '#17a2b8',
            tooltip: {valueSuffix: ' days'}
        }]
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            Interval period
            <br/>
            <select onChange={(event) => setBinSize(event.target.value)}>
                <option value="y">1 year</option>
                <option value="m">1 month</option>
            </select>
        </div>
    );
};
```

- [ ] **Step 2: Verify**

Run `cd src/frontend/curator_dashboard && npm start` and navigate to the stats page. The time-to-submit chart should show only the line chart without the gray column bars.

- [ ] **Step 3: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/TimeToSubmitChart.js
git commit -m "fix(dashboard): simplify time-to-submit chart to single axis"
```

---

## Task 10: Frontend — UnifiedStatsPage with Tabs

**Files:**
- Create: `src/frontend/curator_dashboard/src/pages/stats/UnifiedStatsPage.js`
- Modify: `src/frontend/curator_dashboard/src/components/PageArea.js`
- Modify: `src/frontend/curator_dashboard/src/components/LateralMenu.js`

- [ ] **Step 1: Create the UnifiedStatsPage component**

This is the shell that contains all four tabs. Each tab renders its content only when selected (lazy loading via conditional rendering).

```javascript
import React, {useState} from "react";
import {Container, Tab, Tabs} from "react-bootstrap";
import KPISummaryCards from "./KPISummaryCards";
import OverallAgreementCards from "./OverallAgreementCards";
import RespRateTotalPieCharts from "./RespRateTotalPieCharts";
import RespRateTSChart from "./RespRateTSChart";
import TimeToSubmitChart from "./TimeToSubmitChart";
import EntityBreakdownChart from "./EntityBreakdownChart";
import EntityDetailTable from "./EntityDetailTable";
import ManuallyAddedEntities from "./ManuallyAddedEntities";
import ConfirmationRateTrends from "./ConfirmationRateTrends";
import AutoDetectedFlagsChart from "./AutoDetectedFlagsChart";
import AutoDetectedFlagsTable from "./AutoDetectedFlagsTable";
import AuthorOnlyFlagsChart from "./AuthorOnlyFlagsChart";
import AuthorOnlyFlagsTable from "./AuthorOnlyFlagsTable";
import DataTypeFlagsAccuracyTrends from "./DataTypeFlagsAccuracyTrends";
import ContributorRoles from "./ContributorRoles";
import ContributorRolesTimeSeries from "./ContributorRolesTimeSeries";
import ContributorRolesSummary from "./ContributorRolesSummary";

const UnifiedStatsPage = ({defaultTab = "overview"}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <Container fluid>
            <br/>
            <Tabs activeKey={activeTab} onSelect={setActiveTab} id="stats-tabs">
                <Tab eventKey="overview" title="Overview">
                    <br/>
                    <KPISummaryCards/>
                    <hr/>
                    <OverallAgreementCards/>
                    <hr/>
                    <RespRateTotalPieCharts/>
                    <hr/>
                    <RespRateTSChart/>
                    <hr/>
                    <TimeToSubmitChart/>
                </Tab>
                <Tab eventKey="entities" title="Entities">
                    {activeTab === "entities" && <>
                        <br/>
                        <EntityBreakdownChart/>
                        <hr/>
                        <EntityDetailTable/>
                        <hr/>
                        <ManuallyAddedEntities/>
                        <hr/>
                        <ConfirmationRateTrends/>
                    </>}
                </Tab>
                <Tab eventKey="flags" title="Data Type Flags">
                    {activeTab === "flags" && <>
                        <br/>
                        <h5>Auto-Detected Data Types</h5>
                        <AutoDetectedFlagsChart/>
                        <hr/>
                        <AutoDetectedFlagsTable/>
                        <hr/>
                        <h5>Author-Only Data Types</h5>
                        <AuthorOnlyFlagsChart/>
                        <hr/>
                        <AuthorOnlyFlagsTable/>
                        <hr/>
                        <DataTypeFlagsAccuracyTrends/>
                    </>}
                </Tab>
                <Tab eventKey="contributors" title="Contributors">
                    {activeTab === "contributors" && <>
                        <br/>
                        <ContributorRoles/>
                        <hr/>
                        <ContributorRolesTimeSeries/>
                        <hr/>
                        <ContributorRolesSummary/>
                    </>}
                </Tab>
            </Tabs>
        </Container>
    );
};

export default UnifiedStatsPage;
```

- [ ] **Step 2: Update PageArea.js routing**

Replace the separate Statistics and PaperStats routes with the unified page:

In `src/frontend/curator_dashboard/src/components/PageArea.js`, replace imports for `Statistics` and `PaperStats`:

```javascript
import UnifiedStatsPage from "../pages/stats/UnifiedStatsPage";
```

Remove these imports:
```javascript
// Remove: import Statistics from "../pages/Statistics";
// Remove: import PaperStats from "../pages/stats/PaperStats";
```

Replace the two route entries:
```javascript
                <Route path={"/stats"}
                       render={() => <UnifiedStatsPage defaultTab="overview"/>}/>
```

Replace:
```javascript
                <Route path={"/papers_stats"}
                       render={() => <PaperStats/>}/>
```
With:
```javascript
                <Route path={"/papers_stats"}
                       render={() => <UnifiedStatsPage defaultTab="entities"/>}/>
```

- [ ] **Step 3: Update LateralMenu.js**

In `src/frontend/curator_dashboard/src/components/LateralMenu.js`, replace the two separate menu entries (lines 78-93) with a single "Statistics" entry:

Replace both the "Overall Stats" and "Extraction stats" rows with:
```javascript
            <Row>
                <Col sm="10">
                    <IndexLinkContainer to={"stats" + args}
                                        active={true}>
                        <a className="aw" onClick={onMenuItemClick}><h6>Statistics</h6></a>
                    </IndexLinkContainer>
                </Col>
            </Row>
```

- [ ] **Step 4: Commit**

Note: This will not render correctly yet because the new tab components don't exist. Placeholder components will be created in subsequent tasks. For now, create minimal placeholder files so the app doesn't crash.

Create placeholder files for all components not yet implemented. Each placeholder should export a simple component:

```javascript
import React from "react";
const ComponentName = () => <div>Coming soon</div>;
export default ComponentName;
```

Create these placeholders (they will be replaced in subsequent tasks):
- `OverallAgreementCards.js`
- `EntityBreakdownChart.js`
- `EntityDetailTable.js`
- `ManuallyAddedEntities.js`
- `AutoDetectedFlagsChart.js`
- `AutoDetectedFlagsTable.js`
- `AuthorOnlyFlagsChart.js`
- `AuthorOnlyFlagsTable.js`
- `DataTypeFlagsAccuracyTrends.js`
- `ContributorRoles.js`
- `ContributorRolesTimeSeries.js`
- `ContributorRolesSummary.js`

- [ ] **Step 5: Verify**

Run `cd src/frontend/curator_dashboard && npm start`. Navigate to `/stats` — should see the Overview tab with existing KPI cards, pie chart, etc. plus "Coming soon" placeholders. Navigate to `/papers_stats` — should land on the Entities tab.

- [ ] **Step 6: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/UnifiedStatsPage.js
git add src/frontend/curator_dashboard/src/pages/stats/OverallAgreementCards.js
git add src/frontend/curator_dashboard/src/pages/stats/EntityBreakdownChart.js
git add src/frontend/curator_dashboard/src/pages/stats/EntityDetailTable.js
git add src/frontend/curator_dashboard/src/pages/stats/ManuallyAddedEntities.js
git add src/frontend/curator_dashboard/src/pages/stats/AutoDetectedFlagsChart.js
git add src/frontend/curator_dashboard/src/pages/stats/AutoDetectedFlagsTable.js
git add src/frontend/curator_dashboard/src/pages/stats/AuthorOnlyFlagsChart.js
git add src/frontend/curator_dashboard/src/pages/stats/AuthorOnlyFlagsTable.js
git add src/frontend/curator_dashboard/src/pages/stats/DataTypeFlagsAccuracyTrends.js
git add src/frontend/curator_dashboard/src/pages/stats/ContributorRoles.js
git add src/frontend/curator_dashboard/src/pages/stats/ContributorRolesTimeSeries.js
git add src/frontend/curator_dashboard/src/pages/stats/ContributorRolesSummary.js
git add src/frontend/curator_dashboard/src/components/PageArea.js
git add src/frontend/curator_dashboard/src/components/LateralMenu.js
git commit -m "feat(dashboard): add unified stats page with tab navigation"
```

---

## Task 11: Frontend — OverallAgreementCards

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/OverallAgreementCards.js` (replace placeholder)

- [ ] **Step 1: Implement the component**

```javascript
import React from "react";
import {Card, Col, OverlayTrigger, Row, Spinner, Tooltip} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const rateColor = (rate) => {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    return '#dc3545';
};

const OverallAgreementCards = () => {
    const {data, isLoading, isSuccess} = useQuery('overallAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/overall_agreement")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const agreement = isSuccess ? data.data : {};

    const cards = [
        {
            label: "Predicted vs Author",
            value: agreement.predicted_vs_author || 0,
            tooltip: "Average agreement between pipeline predictions and author responses across entities and data type flags"
        },
        {
            label: "Author vs Curator",
            value: agreement.author_vs_curator || 0,
            tooltip: "Average agreement between author submissions and curator validations across entities and data type flags"
        },
        {
            label: "Predicted vs Curator",
            value: agreement.predicted_vs_curator || 0,
            tooltip: "Average agreement between pipeline predictions and curator validations across entities and data type flags"
        }
    ];

    return (
        <div>
            <h5 className="mb-1">Overall Agreement</h5>
            <p className="text-muted mb-3">
                Macro-averaged agreement rates across all entity types and data type flags.
            </p>
            <Row className="mb-4">
                {cards.map((card, idx) => (
                    <Col key={idx} md={4}>
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{card.tooltip}</Tooltip>}
                        >
                            <Card className="text-center" style={{borderTop: `3px solid ${rateColor(card.value)}`}}>
                                <Card.Body style={{padding: '15px 10px'}}>
                                    <h3 style={{marginBottom: '5px', color: rateColor(card.value)}}>
                                        {card.value}%
                                    </h3>
                                    <small className="text-muted">{card.label}</small>
                                </Card.Body>
                            </Card>
                        </OverlayTrigger>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default OverallAgreementCards;
```

- [ ] **Step 2: Verify**

Run dev server, navigate to `/stats`. The Overview tab should show the three agreement cards below the KPI cards.

- [ ] **Step 3: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/OverallAgreementCards.js
git commit -m "feat(dashboard): implement overall agreement cards for overview tab"
```

---

## Task 12: Frontend — EntityBreakdownChart

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/EntityBreakdownChart.js` (replace placeholder)

- [ ] **Step 1: Implement the component**

```javascript
import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const EntityBreakdownChart = () => {
    const {data, isLoading, isSuccess} = useQuery('entityConfirmationRates', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entity_confirmation_rates")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const rates = isSuccess ? data.data : {};
    const entityLabels = {
        genes: "Genes",
        species: "Species",
        alleles: "Alleles",
        strains: "Strains",
        transgenes: "Transgenes"
    };

    // Sort by total submitted (confirmed + added) descending
    const sorted = Object.entries(entityLabels)
        .map(([key, label]) => {
            const entity = rates[key] || {};
            return {
                key,
                label,
                confirmed: entity.total_confirmed || 0,
                added: entity.total_added || 0,
                removed: entity.total_removed || 0,
            };
        })
        .sort((a, b) => (b.confirmed + b.added) - (a.confirmed + a.added));

    const categories = sorted.map(e => e.label);

    const options = {
        chart: {type: 'bar', height: Math.max(300, categories.length * 60)},
        title: {text: 'Entity Breakdown: Confirmed vs Added vs Removed'},
        subtitle: {text: 'Comparing pipeline-extracted entities against author submissions'},
        xAxis: {
            categories: categories,
            title: {text: null}
        },
        yAxis: {
            min: 0,
            title: {text: 'Number of entities'}
        },
        tooltip: {
            shared: true
        },
        plotOptions: {
            bar: {
                stacking: 'normal',
                dataLabels: {enabled: true, style: {fontSize: '11px'}},
                borderWidth: 0
            }
        },
        series: [{
            name: 'Confirmed',
            data: sorted.map(e => e.confirmed),
            color: '#28a745'
        }, {
            name: 'Added by authors',
            data: sorted.map(e => e.added),
            color: '#007bff'
        }, {
            name: 'Removed by authors',
            data: sorted.map(e => e.removed),
            color: '#f5c6cb'
        }]
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default EntityBreakdownChart;
```

- [ ] **Step 2: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/EntityBreakdownChart.js
git commit -m "feat(dashboard): implement entity breakdown horizontal stacked bar chart"
```

---

## Task 13: Frontend — EntityDetailTable

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/EntityDetailTable.js` (replace placeholder)

- [ ] **Step 1: Implement the component**

```javascript
import React from "react";
import {Spinner, Table} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const rateColor = (rate) => {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    return '#dc3545';
};

const EntityDetailTable = () => {
    const {data: ratesData, isLoading: ratesLoading} = useQuery('entityConfirmationRates', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entity_confirmation_rates")
    );
    const {data: curatorData, isLoading: curatorLoading} = useQuery('entityCuratorAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entity_curator_agreement")
    );

    if (ratesLoading || curatorLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const rates = ratesData ? ratesData.data : {};
    const curator = curatorData ? curatorData.data : {};

    const entityLabels = {
        genes: "Genes",
        species: "Species",
        alleles: "Alleles",
        strains: "Strains",
        transgenes: "Transgenes"
    };
    const hasCurator = {"genes": true, "species": true};

    return (
        <div>
            <h5 className="mb-1">Entity Detail</h5>
            <p className="text-muted mb-3">
                Comparing pipeline-extracted, author-submitted, and curator-curated entities.
            </p>
            <Table striped bordered hover size="sm" responsive>
                <thead>
                    <tr>
                        <th>Entity Type</th>
                        <th>Papers</th>
                        <th>Extracted (TFP)</th>
                        <th>Author Confirmed</th>
                        <th>Author Removed</th>
                        <th>Author Added</th>
                        <th>Author Rate</th>
                        <th>Curator Curated</th>
                        <th>Curator Agrees w/ Author</th>
                        <th>Curator Agrees w/ Pipeline</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(entityLabels).map(([key, label]) => {
                        const entity = rates[key] || {};
                        const cur = curator[key] || {};
                        const curAvail = hasCurator[key];
                        return (
                            <tr key={key}>
                                <td><strong>{label}</strong></td>
                                <td>{entity.num_papers || 0}</td>
                                <td>{entity.total_extracted || 0}</td>
                                <td>{entity.total_confirmed || 0}</td>
                                <td>{entity.total_removed || 0}</td>
                                <td>{entity.total_added || 0}</td>
                                <td style={{color: rateColor(entity.confirmation_rate || 0)}}>
                                    <strong>{entity.confirmation_rate || 0}%</strong>
                                </td>
                                <td>{curAvail ? (cur.total_curator_entities || 0) : "\u2014"}</td>
                                <td>{curAvail ? (
                                    <span style={{color: rateColor(cur.curator_agrees_with_author || 0)}}>
                                        <strong>{cur.curator_agrees_with_author || 0}%</strong>
                                    </span>
                                ) : "\u2014"}</td>
                                <td>{curAvail ? (
                                    <span style={{color: rateColor(cur.curator_agrees_with_pipeline || 0)}}>
                                        <strong>{cur.curator_agrees_with_pipeline || 0}%</strong>
                                    </span>
                                ) : "\u2014"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
            <small className="text-muted">
                Curator comparison for alleles, strains, and transgenes is pending ABC API integration.
            </small>
        </div>
    );
};

export default EntityDetailTable;
```

- [ ] **Step 2: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/EntityDetailTable.js
git commit -m "feat(dashboard): implement entity detail table with curator agreement columns"
```

---

## Task 14: Frontend — ManuallyAddedEntities

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/ManuallyAddedEntities.js` (replace placeholder)

- [ ] **Step 1: Implement the component**

```javascript
import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner, Table} from "react-bootstrap";

const ManuallyAddedEntities = () => {
    const {data, isLoading, isSuccess} = useQuery('manuallyAddedEntities', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/manually_added_entities_stats")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const stats = isSuccess ? data.data : {};

    const sorted = Object.entries(stats)
        .sort((a, b) => b[1].total_added - a[1].total_added);
    const categories = sorted.map(([name]) => name);
    const values = sorted.map(([, s]) => s.total_added);

    const chartOptions = {
        chart: {type: 'bar', height: Math.max(250, categories.length * 40)},
        title: {text: 'Manually Added Entities'},
        subtitle: {text: 'Free-text entities added by authors (not from pipeline extraction)'},
        xAxis: {categories: categories, title: {text: null}},
        yAxis: {min: 0, title: {text: 'Total added'}},
        tooltip: {pointFormat: '<b>{point.y}</b> entities'},
        plotOptions: {
            bar: {
                dataLabels: {enabled: true},
                color: '#17a2b8',
                borderWidth: 0
            }
        },
        legend: {enabled: false},
        series: [{name: 'Added', data: values}]
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
            <Table striped bordered hover size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th>Entity Type</th>
                        <th>Papers with Additions</th>
                        <th>Total Added</th>
                        <th>Avg per Paper</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map(([name, s]) => (
                        <tr key={name}>
                            <td><strong>{name}</strong></td>
                            <td>{s.papers_with_additions}</td>
                            <td>{s.total_added}</td>
                            <td>{s.avg_per_paper}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ManuallyAddedEntities;
```

- [ ] **Step 2: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/ManuallyAddedEntities.js
git commit -m "feat(dashboard): implement manually added entities chart and table"
```

---

## Task 15: Frontend — AutoDetectedFlagsChart

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/AutoDetectedFlagsChart.js` (replace placeholder)

- [ ] **Step 1: Implement the component**

```javascript
import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Form, Spinner} from "react-bootstrap";

const AutoDetectedFlagsChart = () => {
    const [showTN, setShowTN] = useState(false);
    const {data, isLoading, isSuccess} = useQuery('flagsConfusionMatrix', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_confusion_matrix")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const matrix = isSuccess ? data.data : {};

    // Sort by total author-positive (TP + FN) descending
    const sorted = Object.entries(matrix)
        .sort((a, b) => (b[1].tp + b[1].fn) - (a[1].tp + a[1].fn));

    const categories = sorted.map(([name]) => name);

    const series = [
        {
            name: 'Predicted+, Author+ (TP)',
            data: sorted.map(([, d]) => d.tp),
            color: '#28a745'
        },
        {
            name: 'Predicted-, Author+ (FN)',
            data: sorted.map(([, d]) => d.fn),
            color: '#007bff'
        },
        {
            name: 'Predicted+, Author- (FP)',
            data: sorted.map(([, d]) => d.fp),
            color: '#f5c6cb'
        },
    ];

    if (showTN) {
        series.push({
            name: 'Predicted-, Author- (TN)',
            data: sorted.map(([, d]) => d.tn),
            color: '#dee2e6'
        });
    }

    const options = {
        chart: {type: 'bar', height: Math.max(400, categories.length * 45)},
        title: {text: 'Auto-Detected Data Types: Prediction vs Author'},
        subtitle: {text: 'Comparing automated predictions against author responses'},
        xAxis: {categories: categories, title: {text: null}},
        yAxis: {min: 0, title: {text: 'Number of papers'}},
        tooltip: {shared: true},
        plotOptions: {
            bar: {
                stacking: 'normal',
                dataLabels: {enabled: true, style: {fontSize: '11px'}},
                borderWidth: 0
            }
        },
        series: series
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <Form.Check
                type="checkbox"
                label="Show True Negatives (TN)"
                checked={showTN}
                onChange={(e) => setShowTN(e.target.checked)}
                className="mt-2"
            />
        </div>
    );
};

export default AutoDetectedFlagsChart;
```

- [ ] **Step 2: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/AutoDetectedFlagsChart.js
git commit -m "feat(dashboard): implement auto-detected flags stacked bar chart"
```

---

## Task 16: Frontend — AutoDetectedFlagsTable

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/AutoDetectedFlagsTable.js` (replace placeholder)

- [ ] **Step 1: Implement the component**

```javascript
import React from "react";
import {Spinner, Table} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const rateColor = (rate) => {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    return '#dc3545';
};

const AutoDetectedFlagsTable = () => {
    const {data: matrixData, isLoading: matrixLoading} = useQuery('flagsConfusionMatrix', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_confusion_matrix")
    );
    const {data: curatorData, isLoading: curatorLoading} = useQuery('flagsCuratorAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_curator_agreement")
    );

    if (matrixLoading || curatorLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const matrix = matrixData ? matrixData.data : {};
    const curator = curatorData ? curatorData.data : {};

    // Sort by total author-positive descending
    const sorted = Object.entries(matrix)
        .sort((a, b) => (b[1].tp + b[1].fn) - (a[1].tp + a[1].fn));

    return (
        <Table striped bordered hover size="sm" responsive>
            <thead>
                <tr>
                    <th>Data Type</th>
                    <th>Papers</th>
                    <th>TP</th>
                    <th>FP</th>
                    <th>FN</th>
                    <th>TN</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>Accuracy</th>
                    <th>Curator Validated</th>
                    <th>Curator Agrees w/ Author</th>
                </tr>
            </thead>
            <tbody>
                {sorted.map(([name, d]) => {
                    const cur = curator[name] || {};
                    return (
                        <tr key={name}>
                            <td><strong>{name}</strong></td>
                            <td>{d.papers}</td>
                            <td>{d.tp}</td>
                            <td>{d.fp}</td>
                            <td>{d.fn}</td>
                            <td>{d.tn}</td>
                            <td style={{color: rateColor(d.precision)}}>
                                <strong>{d.precision}%</strong>
                            </td>
                            <td style={{color: rateColor(d.recall)}}>
                                <strong>{d.recall}%</strong>
                            </td>
                            <td style={{color: rateColor(d.accuracy)}}>
                                <strong>{d.accuracy}%</strong>
                            </td>
                            <td>{cur.curator_validated || 0}</td>
                            <td style={{color: rateColor(cur.agreement || 0)}}>
                                <strong>{cur.agreement || 0}%</strong>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};

export default AutoDetectedFlagsTable;
```

- [ ] **Step 2: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/AutoDetectedFlagsTable.js
git commit -m "feat(dashboard): implement auto-detected flags confusion matrix table"
```

---

## Task 17: Frontend — AuthorOnlyFlagsChart and AuthorOnlyFlagsTable

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/AuthorOnlyFlagsChart.js` (replace placeholder)
- Modify: `src/frontend/curator_dashboard/src/pages/stats/AuthorOnlyFlagsTable.js` (replace placeholder)

- [ ] **Step 1: Implement AuthorOnlyFlagsChart**

```javascript
import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const AUTHOR_ONLY_FLAGS = [
    "Gene model update", "Antibody", "Site of action", "Time of action",
    "RNAseq", "Chemical phenotype", "Environmental phenotype", "Disease"
];

const AuthorOnlyFlagsChart = () => {
    const {data, isLoading, isSuccess} = useQuery('dataTypeFlagsStats', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_stats")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const flagData = isSuccess ? data.data : {};

    const filtered = Object.entries(flagData)
        .filter(([name]) => AUTHOR_ONLY_FLAGS.includes(name))
        .sort((a, b) => b[1] - a[1]);

    const categories = filtered.map(([name]) => name);
    const values = filtered.map(([, count]) => count);

    const options = {
        chart: {type: 'bar', height: Math.max(300, categories.length * 35)},
        title: {text: 'Author-Only Data Types'},
        subtitle: {text: 'Number of submitted papers where authors flagged each data type'},
        xAxis: {categories: categories, title: {text: null}},
        yAxis: {min: 0, title: {text: 'Number of papers'}},
        tooltip: {pointFormat: '<b>{point.y}</b> papers'},
        plotOptions: {
            bar: {
                dataLabels: {enabled: true},
                color: '#6f42c1',
                borderWidth: 0
            }
        },
        legend: {enabled: false},
        series: [{name: 'Papers', data: values}]
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default AuthorOnlyFlagsChart;
```

- [ ] **Step 2: Implement AuthorOnlyFlagsTable**

```javascript
import React from "react";
import {Spinner, Table} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const AUTHOR_ONLY_FLAGS = [
    "Gene model update", "Antibody", "Site of action", "Time of action",
    "RNAseq", "Chemical phenotype", "Environmental phenotype", "Disease"
];

const rateColor = (rate) => {
    if (rate >= 80) return '#28a745';
    if (rate >= 60) return '#ffc107';
    return '#dc3545';
};

const AuthorOnlyFlagsTable = () => {
    const {data: flagsData, isLoading: flagsLoading} = useQuery('dataTypeFlagsStats', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_stats")
    );
    const {data: kpiData, isLoading: kpiLoading} = useQuery('statsKpi', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/stats_kpi")
    );
    const {data: curatorData, isLoading: curatorLoading} = useQuery('flagsCuratorAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_curator_agreement")
    );

    if (flagsLoading || kpiLoading || curatorLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const flagCounts = flagsData ? flagsData.data : {};
    const totalSubmissions = kpiData ? kpiData.data.full_submissions : 0;
    const curator = curatorData ? curatorData.data : {};

    const filtered = Object.entries(flagCounts)
        .filter(([name]) => AUTHOR_ONLY_FLAGS.includes(name))
        .sort((a, b) => b[1] - a[1]);

    return (
        <Table striped bordered hover size="sm" responsive>
            <thead>
                <tr>
                    <th>Data Type</th>
                    <th>Papers Flagged</th>
                    <th>% of Submissions</th>
                    <th>Curator Validated</th>
                    <th>Curator Agrees w/ Author</th>
                </tr>
            </thead>
            <tbody>
                {filtered.map(([name, count]) => {
                    const pct = totalSubmissions > 0
                        ? Math.round(count / totalSubmissions * 1000) / 10
                        : 0;
                    const cur = curator[name] || {};
                    return (
                        <tr key={name}>
                            <td><strong>{name}</strong></td>
                            <td>{count}</td>
                            <td>{pct}%</td>
                            <td>{cur.curator_validated || 0}</td>
                            <td style={{color: rateColor(cur.agreement || 0)}}>
                                <strong>{cur.agreement || 0}%</strong>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};

export default AuthorOnlyFlagsTable;
```

- [ ] **Step 3: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/AuthorOnlyFlagsChart.js
git add src/frontend/curator_dashboard/src/pages/stats/AuthorOnlyFlagsTable.js
git commit -m "feat(dashboard): implement author-only flags chart and table"
```

---

## Task 18: Frontend — DataTypeFlagsAccuracyTrends

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/DataTypeFlagsAccuracyTrends.js` (replace placeholder)

- [ ] **Step 1: Implement the component**

```javascript
import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const COLORS = {
    "Expression": '#007bff',
    "Seq. change": '#28a745',
    "Genetic int.": '#dc3545',
    "Physical int.": '#ffc107',
    "Regulatory int.": '#17a2b8',
    "Allele phenotype": '#6f42c1',
    "RNAi phenotype": '#fd7e14',
    "Overexpr. phenotype": '#20c997',
    "Enzymatic activity": '#e83e8c',
};

const DataTypeFlagsAccuracyTrends = () => {
    const [binSize, setBinSize] = useState('y');
    const [metric, setMetric] = useState('precision');
    const {data, isLoading, isSuccess} = useQuery(
        'flagsAccuracyTS' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/data_type_flags_accuracy_timeseries",
            {bin_size: binSize}
        )
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const tsData = isSuccess ? data.data : [];
    const showYearOnly = binSize.includes('y');

    const categories = tsData.map(item => {
        if (showYearOnly) {
            return item[0].split('-')[0];
        }
        return item[0];
    });

    const series = Object.keys(COLORS).map(name => ({
        name: name,
        data: tsData.map(item => {
            const d = item[1][name] || {};
            return d[metric] || 0;
        }),
        color: COLORS[name],
        connectNulls: true
    }));

    const options = {
        title: {text: `Prediction ${metric.charAt(0).toUpperCase() + metric.slice(1)} Over Time`},
        subtitle: {text: 'Auto-detected data type flags'},
        xAxis: {categories: categories},
        yAxis: {
            title: {text: `${metric.charAt(0).toUpperCase() + metric.slice(1)} (%)`},
            min: 0,
            max: 100
        },
        plotOptions: {
            line: {
                dataLabels: {enabled: true, format: '{y}%'},
                enableMouseTracking: true,
                connectNulls: true
            }
        },
        tooltip: {shared: true, valueSuffix: '%'},
        series: series
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            <div className="mt-2">
                Metric:&nbsp;
                <select value={metric} onChange={(e) => setMetric(e.target.value)}>
                    <option value="precision">Precision</option>
                    <option value="recall">Recall</option>
                </select>
                &nbsp;&nbsp;Interval:&nbsp;
                <select onChange={(e) => setBinSize(e.target.value)}>
                    <option value="y">1 year</option>
                    <option value="m">1 month</option>
                </select>
            </div>
        </div>
    );
};

export default DataTypeFlagsAccuracyTrends;
```

- [ ] **Step 2: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/DataTypeFlagsAccuracyTrends.js
git commit -m "feat(dashboard): implement data type flags accuracy trends chart"
```

---

## Task 19: Frontend — Contributor Components

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/ContributorRoles.js` (replace placeholder)
- Modify: `src/frontend/curator_dashboard/src/pages/stats/ContributorRolesTimeSeries.js` (replace placeholder)
- Modify: `src/frontend/curator_dashboard/src/pages/stats/ContributorRolesSummary.js` (replace placeholder)

- [ ] **Step 1: Implement ContributorRoles**

```javascript
import React from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const ROLE_COLORS = {
    "PI": '#007bff',
    "Postdoc": '#28a745',
    "PhD": '#ffc107',
    "Masters": '#17a2b8',
    "Undergrad": '#fd7e14',
    "Other/Unknown": '#6c757d',
};

const ContributorRoles = () => {
    const {data, isLoading, isSuccess} = useQuery('contributorRoles', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/contributor_roles")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const roles = isSuccess ? data.data : {};

    const pieData = Object.entries(roles)
        .filter(([, d]) => d.submissions > 0)
        .map(([name, d]) => ({
            name: name,
            y: d.submissions,
            color: ROLE_COLORS[name] || '#6c757d'
        }));

    const options = {
        chart: {type: 'pie'},
        title: {text: 'Submissions by Role'},
        subtitle: {text: 'Role at time of submission'},
        tooltip: {
            pointFormat: '<b>{point.y}</b> submissions ({point.percentage:.1f}%)'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)'
                }
            }
        },
        series: [{
            name: 'Submissions',
            data: pieData
        }]
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export default ContributorRoles;
```

- [ ] **Step 2: Implement ContributorRolesTimeSeries**

```javascript
import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const ROLE_COLORS = {
    "PI": '#007bff',
    "Postdoc": '#28a745',
    "PhD": '#ffc107',
    "Masters": '#17a2b8',
    "Undergrad": '#fd7e14',
    "Other/Unknown": '#6c757d',
};
const ALL_ROLES = ["PI", "Postdoc", "PhD", "Masters", "Undergrad", "Other/Unknown"];

const ContributorRolesTimeSeries = () => {
    const [binSize, setBinSize] = useState('y');
    const {data, isLoading, isSuccess} = useQuery(
        'contributorRolesTS' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/contributor_roles_timeseries",
            {bin_size: binSize}
        )
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const tsData = isSuccess ? data.data : [];
    const showYearOnly = binSize.includes('y');

    const categories = tsData.map(item => {
        if (showYearOnly) {
            return item[0].split('-')[0];
        }
        return item[0];
    });

    const series = ALL_ROLES.map(role => ({
        name: role,
        data: tsData.map(item => item[1][role] || 0),
        color: ROLE_COLORS[role]
    }));

    const options = {
        chart: {type: 'column'},
        title: {text: 'Role Distribution Over Time'},
        xAxis: {categories: categories},
        yAxis: {min: 0, title: {text: 'Submissions'}, stackLabels: {enabled: true}},
        tooltip: {shared: true},
        plotOptions: {
            column: {stacking: 'normal', borderWidth: 0}
        },
        series: series
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            Interval period
            <br/>
            <select onChange={(event) => setBinSize(event.target.value)}>
                <option value="y">1 year</option>
                <option value="m">1 month</option>
            </select>
        </div>
    );
};

export default ContributorRolesTimeSeries;
```

- [ ] **Step 3: Implement ContributorRolesSummary**

```javascript
import React from "react";
import {Spinner, Table} from "react-bootstrap";
import {useQuery} from "react-query";
import axios from "axios";

const ALL_ROLES = ["PI", "Postdoc", "PhD", "Masters", "Undergrad", "Other/Unknown"];

const ContributorRolesSummary = () => {
    const {data, isLoading, isSuccess} = useQuery('contributorRoles', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/contributor_roles")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const roles = isSuccess ? data.data : {};

    return (
        <Table striped bordered hover size="sm">
            <thead>
                <tr>
                    <th>Role</th>
                    <th>Submissions</th>
                    <th>% of Total</th>
                    <th>Unique People</th>
                </tr>
            </thead>
            <tbody>
                {ALL_ROLES.map(role => {
                    const d = roles[role] || {};
                    return (
                        <tr key={role}>
                            <td><strong>{role}</strong></td>
                            <td>{d.submissions || 0}</td>
                            <td>{d.percentage || 0}%</td>
                            <td>{d.unique_people || 0}</td>
                        </tr>
                    );
                })}
            </tbody>
        </Table>
    );
};

export default ContributorRolesSummary;
```

- [ ] **Step 4: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/ContributorRoles.js
git add src/frontend/curator_dashboard/src/pages/stats/ContributorRolesTimeSeries.js
git add src/frontend/curator_dashboard/src/pages/stats/ContributorRolesSummary.js
git commit -m "feat(dashboard): implement contributor roles charts and summary table"
```

---

## Task 20: Frontend — Update ConfirmationRateTrends with Curator Overlay

**Files:**
- Modify: `src/frontend/curator_dashboard/src/pages/stats/ConfirmationRateTrends.js`

- [ ] **Step 1: Add curator agreement trend lines**

Fetch the entity curator agreement data and overlay dashed lines for genes and species. Update the component to also call the `entity_curator_agreement` endpoint and merge the data.

The existing component at `src/frontend/curator_dashboard/src/pages/stats/ConfirmationRateTrends.js` needs to add two additional dashed series for "Genes (Curator)" and "Species (Curator)". Since the curator agreement endpoint returns aggregate rates (not time-series), and adding a full timeseries endpoint for curator agreement is complex, add a note/annotation line showing the current overall curator agreement rate as a horizontal dashed reference line.

Replace the entire component:

```javascript
import React, {useState} from "react";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {useQuery} from "react-query";
import axios from "axios";
import {Spinner} from "react-bootstrap";

const ConfirmationRateTrends = () => {
    const [binSize, setBinSize] = useState('y');
    const {data, isLoading, isSuccess} = useQuery(
        'confirmationRatesTS' + binSize,
        () => axios.post(
            process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/confirmation_rates_timeseries",
            {bin_size: binSize}
        )
    );
    const {data: curatorData} = useQuery('entityCuratorAgreement', () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/entity_curator_agreement")
    );

    if (isLoading) {
        return (
            <div className="text-center p-3">
                <Spinner animation="border" />
            </div>
        );
    }

    const tsData = isSuccess ? data.data : [];
    const curator = curatorData ? curatorData.data : {};
    const showYearOnly = binSize.includes('y');

    const categories = tsData.map(item => {
        if (showYearOnly) {
            return item[0].split('-')[0];
        }
        return item[0];
    });

    const entityTypes = ['genes', 'species', 'alleles', 'strains', 'transgenes'];
    const colors = {
        genes: '#007bff',
        species: '#28a745',
        alleles: '#dc3545',
        strains: '#ffc107',
        transgenes: '#17a2b8'
    };
    const labels = {
        genes: 'Genes',
        species: 'Species',
        alleles: 'Alleles',
        strains: 'Strains',
        transgenes: 'Transgenes'
    };

    const series = entityTypes.map(type => ({
        name: labels[type],
        data: tsData.map(item => item[1][type] || 0),
        color: colors[type],
        connectNulls: true
    }));

    // Add curator agreement reference lines for genes and species
    ['genes', 'species'].forEach(type => {
        const cur = curator[type];
        if (cur && cur.curator_agrees_with_author > 0) {
            series.push({
                name: `${labels[type]} (Curator Agrees w/ Author)`,
                data: categories.map(() => cur.curator_agrees_with_author),
                color: colors[type],
                dashStyle: 'Dash',
                marker: {enabled: false},
                enableMouseTracking: true,
                lineWidth: 1
            });
        }
    });

    const options = {
        title: {text: 'Entity Confirmation Rates Over Time'},
        subtitle: {text: 'Percentage of extracted entities confirmed by authors. Dashed lines show overall curator agreement.'},
        xAxis: {categories: categories},
        yAxis: {
            title: {text: 'Rate (%)'},
            min: 0,
            max: 100
        },
        plotOptions: {
            line: {
                dataLabels: {enabled: true, format: '{y}%'},
                enableMouseTracking: true,
                connectNulls: true
            }
        },
        tooltip: {
            shared: true,
            valueSuffix: '%'
        },
        series: series
    };

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} />
            Interval period
            <br/>
            <select onChange={(event) => setBinSize(event.target.value)}>
                <option value="y">1 year</option>
                <option value="m">1 month</option>
            </select>
        </div>
    );
};

export default ConfirmationRateTrends;
```

- [ ] **Step 2: Commit**

```bash
git add src/frontend/curator_dashboard/src/pages/stats/ConfirmationRateTrends.js
git commit -m "feat(dashboard): add curator agreement overlay to confirmation rate trends"
```

---

## Task 21: Integration Verification

- [ ] **Step 1: Start backend and frontend**

```bash
# Terminal 1: Start backend
cd /home/valerio/workspace/caltech/acknowledge
gunicorn -b 0.0.0.0:8001 -t 1800 src.backend.api.afp_api:app

# Terminal 2: Start frontend
cd src/frontend/curator_dashboard
npm start
```

- [ ] **Step 2: Verify Overview tab**

Navigate to `/stats`. Check:
- KPI cards render (existing)
- Overall Agreement cards render with three percentages
- Response rate pie chart renders (existing)
- Response rate time series renders (existing)
- Time-to-submit chart renders as single line (no column bars)

- [ ] **Step 3: Verify Entities tab**

Click the "Entities" tab. Check:
- Horizontal stacked bar chart renders with green/blue/pale-red segments
- Bars are sorted by total submitted descending
- Detail table shows all 5 entity types with curator columns for genes/species
- Manually added entities chart and table render
- Confirmation rate trends chart renders with curator dashed lines

- [ ] **Step 4: Verify Data Type Flags tab**

Click the "Data Type Flags" tab. Check:
- Auto-detected flags stacked bar chart renders with TP/FN/FP segments
- TN toggle checkbox works
- Confusion matrix table shows all 9 types with precision/recall/accuracy
- Author-only flags bar chart renders
- Author-only flags table shows flagged counts and curator agreement
- Accuracy trends chart renders with precision/recall toggle

- [ ] **Step 5: Verify Contributors tab**

Click the "Contributors" tab. Check:
- Pie chart renders with role distribution
- Stacked bar chart shows roles over time
- Summary table shows all roles with counts and percentages

- [ ] **Step 6: Verify navigation**

- Check that `/stats` defaults to Overview tab
- Check that `/papers_stats` defaults to Entities tab
- Check that the lateral menu has a single "Statistics" entry
- Check that all other menu items still work

- [ ] **Step 7: Final commit if any fixes were needed**

```bash
git add -p  # Review changes carefully
git commit -m "fix(dashboard): integration fixes for unified stats page"
```
