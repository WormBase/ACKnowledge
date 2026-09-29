import json
import logging
import os
import re
from collections import Counter, defaultdict

import falcon
import numpy as np
import requests
from wbtools.db.dbmanager import WBDBManager
from wbtools.lib.nlp.common import EntityType
from wbtools.literature.corpus import CorpusManager
from wbtools.literature.paper import WBPaper

from src.backend.common.abc_paper_data import ack_pipeline_levels, ack_pipeline_tfp_strings, get_ack_pipeline_tags
from src.backend.common.config import load_config_from_file

logger = logging.getLogger(__name__)


MIN_CLASS_VAL = "medium"
# datatypes of the flagged tab; seqchange is manual-only and never has an automated value
FLAGGED_DATATYPES = ("otherexpr", "seqchange", "geneint", "geneprod", "genereg", "newmutant", "rnai", "overexpr",
                     "catalyticact")
MANUAL_ONLY_DATATYPES = ("seqchange",)
# lists response key -> tfp_*/afp_* table suffix
LIST_TABLES = {"genestudied": "genestudied", "species": "species", "alleles": "variation", "strains": "strain",
               "transgenes": "transgene"}
CLASSIFIER_STATS_WARNING = ("Classifier statistics are unavailable until the ABC statistics endpoints are available "
                            "(SCRUM-6600).")
CLASSIFIER_STATS_UNAVAILABLE = {"unavailable": True, "reason": CLASSIFIER_STATS_WARNING}


class CuratorDashboardReader:

    def __init__(self, db_manager: WBDBManager, afp_base_url: str, tazendra_username, tazendra_password):
        self.db = db_manager
        self.afp_base_url = afp_base_url
        self.tazendra_username = tazendra_username
        self.tazendra_password = tazendra_password
        self.datatype_topics = load_config_from_file()["abc_classifications"]["datatype_topics"]

    @staticmethod
    def transform_none_to_string(val):
        if val is None:
            return 'null'
        else:
            return val

    def get_all_lists(self, paper_id):
        """Get the pre-populated (tfp) and author (afp) entities of a paper.

        The pre-populated entities come from the paper's ACKnowledge_pipeline tags in the ABC, if it has any, and
        otherwise from the tfp_* tables.
        """
        tags = get_ack_pipeline_tags(paper_id)
        abc_tfp = ack_pipeline_tfp_strings(tags) if tags is not None else None
        lists = {}
        for key, table in LIST_TABLES.items():
            if abc_tfp is not None:
                lists["tfp_" + key] = abc_tfp[table]
            else:
                lists["tfp_" + key] = self.transform_none_to_string(self.db._get_single_field(paper_id, "tfp_" + table))
            lists["afp_" + key] = self.transform_none_to_string(self.db._get_single_field(paper_id, "afp_" + table))
        return lists

    def get_class_author_sub_val(self, table_name, paper_id):
        afp_val = self.db._get_single_field(paper_id, table_name)
        if afp_val is not None:
            afp_val_checked = afp_val != ""
            afp_val_details = afp_val if afp_val != "Checked" and afp_val != "checked" and afp_val != "" else ""
        else:
            afp_val_checked = 'null'
            afp_val_details = 'null'
        return afp_val_checked, afp_val_details

    def get_class_author_sub_val_json(self, table_name, paper_id):
        afp_val = self.db._get_single_field(paper_id, table_name)
        if afp_val is not None:
            try:
                # Try to parse as JSON
                disease_data = json.loads(afp_val)
                afp_val_checked = disease_data.get('checked', False)
                afp_val_details = disease_data.get('comment', '')
            except json.JSONDecodeError:
                # Fallback to old format for backward compatibility
                afp_val_checked = afp_val != ""
                afp_val_details = afp_val if afp_val != "Checked" and afp_val != "checked" and afp_val != "" else ""
        else:
            afp_val_checked = 'null'
            afp_val_details = 'null'
        return afp_val_checked, afp_val_details


    def get_all_flagged_data_types(self, paper_id):
        """Get what ACKnowledge pre-checked (svm_*) and what the author answered (afp_*) for the flagged datatypes.

        The pre-checks come from the paper's ACKnowledge_pipeline classification tags in the ABC, if it has any, and
        otherwise from the Caltech cur_blackbox values (MEDIUM and above).
        """
        tags = get_ack_pipeline_tags(paper_id)
        levels = ack_pipeline_levels(tags, self.datatype_topics) if tags is not None else {}
        classifications = None if levels else self.db.paper.get_automated_classification_values(paper_id)
        flagged = {}
        for datatype in FLAGGED_DATATYPES:
            if datatype in MANUAL_ONLY_DATATYPES:
                pre_checked = False
            elif levels:
                pre_checked = levels.get(datatype, "NEG") != "NEG"
            else:
                pre_checked = self.db.paper.is_paper_positive_for_class(
                    automated_classification_values=classifications, cl=datatype, min_value=MIN_CLASS_VAL)
            flagged[f"svm_{datatype}_checked"] = pre_checked
            checked, details = self.get_class_author_sub_val(f"afp_{datatype}", paper_id)
            flagged[f"afp_{datatype}_checked"] = checked
            flagged[f"afp_{datatype}_details"] = details
        return flagged

    def get_all_yes_no_data_types(self, paper_id):
        afp_modchange_checked, afp_modchange_details = self.get_class_author_sub_val("afp_structcorr", paper_id)
        afp_newantibody_checked, afp_newantibody_details = self.get_class_author_sub_val("afp_antibody", paper_id)
        afp_siteaction_checked, afp_siteaction_details = self.get_class_author_sub_val("afp_siteaction", paper_id)
        afp_timeaction_checked, afp_timeaction_details = self.get_class_author_sub_val("afp_timeaction", paper_id)
        afp_chemphen_checked, afp_chemphen_details = self.get_class_author_sub_val("afp_chemphen", paper_id)
        afp_envpheno_checked, afp_envpheno_details = self.get_class_author_sub_val("afp_envpheno", paper_id)
        afp_catalyticact_checked, afp_catalyticact_details = self.get_class_author_sub_val("afp_catalyticact", paper_id)
        afp_humdis_checked, afp_humdis_details = self.get_class_author_sub_val_json("afp_humdis", paper_id)
        afp_othergenefunc_checked, afp_othergenefunc_details = self.get_class_author_sub_val("afp_othergenefunc", paper_id)
        return {"afp_modchange_checked": afp_modchange_checked, "afp_modchange_details": afp_modchange_details,
                "afp_newantibody_checked": afp_newantibody_checked, "afp_newantibody_details": afp_newantibody_details,
                "afp_siteaction_checked": afp_siteaction_checked, "afp_siteaction_details": afp_siteaction_details,
                "afp_timeaction_checked": afp_timeaction_checked, "afp_timeaction_details": afp_timeaction_details,
                "afp_chemphen_checked": afp_chemphen_checked, "afp_chemphen_details": afp_chemphen_details,
                "afp_envpheno_checked": afp_envpheno_checked, "afp_envpheno_details": afp_envpheno_details,
                "afp_catalyticact_checked": afp_catalyticact_checked, "afp_catalyticact_details":
                    afp_catalyticact_details,
                "afp_humdis_checked": afp_humdis_checked, "afp_humdis_details": afp_humdis_details,
                "afp_othergenefunc_checked": afp_othergenefunc_checked,
                "afp_othergenefunc_details": afp_othergenefunc_details}

    def get_other_data_types(self, paper_id):
        othervariations = self.db._get_single_field(paper_id, "afp_othervariation")
        afp_newalleles = " | ".join([elem['name'] for elem in json.loads(othervariations)]) if \
            othervariations and othervariations != 'null' else ""
        otherstrains = self.db._get_single_field(paper_id, "afp_otherstrain")
        afp_newstrains = " | ".join([elem['name'] for elem in json.loads(otherstrains)]) if \
            otherstrains and otherstrains != 'null' else ""
        othertransgenes = self.db._get_single_field(paper_id, "afp_othertransgene")
        afp_newtransgenes = " | ".join([elem['name'] for elem in json.loads(othertransgenes)]) if \
            othertransgenes and othertransgenes != 'null' else ""
        otherantibodies = self.db._get_single_field(paper_id, "afp_otherantibody")
        afp_otherantibodies = " | ".join([elem['name'] for elem in
                                          json.loads(otherantibodies) if
                                          elem["name"] != ""]) if otherantibodies and otherantibodies != 'null' else ""
        otherspecies = self.db._get_single_field(paper_id, "afp_otherspecies")
        afp_newspecies = " | ".join([elem['name'] for elem in json.loads(otherspecies)]) if \
            otherspecies and otherspecies != 'null' else ""
        return {"afp_newalleles": afp_newalleles, "afp_newstrains": afp_newstrains,
                "afp_newtransgenes": afp_newtransgenes, "afp_otherantibodies": afp_otherantibodies,
                "afp_newspecies": afp_newspecies}

    def get_text_from_pdfs(self, paper_id):
        cm = CorpusManager()
        cm.load_from_wb_database(
            self.db.db_name, self.db.user, self.db.password, self.db.host,
            must_be_autclass_flagged=True, exclude_no_main_text=True,
            exclude_no_author_email=True, exclude_temp_pdf=True, paper_ids=[paper_id], main_file_only=True)
        paper = cm.get_paper(paper_id)
        sentences = paper.get_text_docs(include_supplemental=False, split_sentences=True, return_concatenated=False)
        sentences = [sentence.replace('"', "'") for sentence in sentences]
        sentences = [sentence.replace('\n', ' ') for sentence in sentences]
        sentences = [re.sub(r'[\x00-\x1F\x7F-\x9F]', '', sentence) for sentence in sentences]
        fulltext = " ".join(sentences)
        sentences = [sent for sent in sentences if np.average([len(w) for w in sent.split(' ')]) > 2]
        sentences = [sentence for sentence in sentences if len(sentence) > 20 and len(sentence.split(" ")) > 2]
        paper.abstract = paper.abstract if paper.abstract else ""
        paper.title = paper.title if paper.title else ""
        counter = Counter(sentences)
        sentences = sorted(list(set(sentences)))
        counter_list = [counter[sentence] for sentence in sentences]
        res = requests.post(f"{os.environ['SENTENCE_CLASSIFICATION_API']}/api/sentence_classification/"
                            f"classify_sentences",
                            {"sentences": sentences})
        return fulltext, sentences, counter_list, json.dumps(res.json()["classes"])

    def _compute_entity_confirmation_rates(self):
        entity_types = {
            "genes": "genestudied",
            "species": "species",
            "alleles": "variation",
            "strains": "strain",
            "transgenes": "transgene"
        }
        results = {}
        for label, table_name in entity_types.items():
            with self.db.afp.get_cursor() as curs:
                curs.execute(
                    "SELECT tfp_{t}.tfp_{t}, afp_{t}.afp_{t} "
                    "FROM tfp_{t} "
                    "JOIN afp_{t} ON tfp_{t}.joinkey = afp_{t}.joinkey "
                    "JOIN afp_version ON tfp_{t}.joinkey = afp_version.joinkey "
                    "JOIN afp_lasttouched ON tfp_{t}.joinkey = afp_lasttouched.joinkey "
                    "WHERE afp_version.afp_version = '2'".format(t=table_name)
                )
                rows = curs.fetchall()

            total_extracted = 0
            total_confirmed = 0
            total_added = 0
            total_removed = 0
            num_papers = len(rows)

            for tfp_val, afp_val in rows:
                extracted = set(
                    e.strip() for e in (tfp_val or "").split(" | ") if e.strip()
                )
                submitted = set(
                    e.strip() for e in (afp_val or "").split(" | ") if e.strip()
                )
                confirmed = extracted & submitted
                removed = extracted - submitted
                added = submitted - extracted

                total_extracted += len(extracted)
                total_confirmed += len(confirmed)
                total_removed += len(removed)
                total_added += len(added)

            confirmation_rate = round(
                (total_confirmed / total_extracted * 100) if total_extracted > 0 else 0, 1
            )
            total_submitted = total_confirmed + total_added
            union_size = total_extracted + total_added
            jaccard_pa = round(
                (total_confirmed / union_size * 100)
                if union_size > 0 else 0, 1
            )
            results[label] = {
                "total_extracted": total_extracted,
                "total_confirmed": total_confirmed,
                "total_removed": total_removed,
                "total_added": total_added,
                "total_submitted": total_submitted,
                "confirmation_rate": confirmation_rate,
                "jaccard_pred_author": jaccard_pa,
                "num_papers": num_papers
            }
        return results

    def _compute_confirmation_rates_timeseries(self, bin_period='y'):
        entity_types = {
            "genes": "genestudied",
            "species": "species",
            "alleles": "variation",
            "strains": "strain",
            "transgenes": "transgene"
        }
        period_data = defaultdict(lambda: defaultdict(
            lambda: {"extracted": 0, "confirmed": 0, "added": 0}
        ))

        for label, table_name in entity_types.items():
            with self.db.afp.get_cursor() as curs:
                curs.execute(
                    "SELECT tfp_{t}.tfp_{t}, afp_{t}.afp_{t}, "
                    "afp_email.afp_timestamp "
                    "FROM tfp_{t} "
                    "JOIN afp_{t} ON tfp_{t}.joinkey = afp_{t}.joinkey "
                    "JOIN afp_version ON tfp_{t}.joinkey = afp_version.joinkey "
                    "JOIN afp_lasttouched ON tfp_{t}.joinkey = "
                    "afp_lasttouched.joinkey "
                    "JOIN afp_email ON tfp_{t}.joinkey = afp_email.joinkey "
                    "WHERE afp_version.afp_version = '2'".format(t=table_name)
                )
                rows = curs.fetchall()

            for tfp_val, afp_val, email_ts in rows:
                if email_ts is None:
                    continue
                if bin_period == 'y':
                    period_key = email_ts.strftime('%Y')
                else:
                    period_key = email_ts.strftime('%Y-%m')

                extracted = set(
                    e.strip() for e in (tfp_val or "").split(" | ")
                    if e.strip()
                )
                submitted = set(
                    e.strip() for e in (afp_val or "").split(" | ")
                    if e.strip()
                )
                confirmed = extracted & submitted
                added = submitted - extracted

                period_data[period_key][label]["extracted"] += len(extracted)
                period_data[period_key][label]["confirmed"] += len(confirmed)
                period_data[period_key][label]["added"] += len(added)

        result = []
        for period_key in sorted(period_data.keys()):
            period_rates = {}
            for label in entity_types.keys():
                d = period_data[period_key][label]
                ext = d["extracted"]
                conf = d["confirmed"]
                added = d["added"]
                submitted = conf + added
                union = ext + added
                jaccard = round(
                    (conf / union * 100) if union > 0 else 0, 1
                )
                period_rates[label] = jaccard
            result.append([period_key, period_rates])
        return result

    def _compute_data_type_flags_curator_agreement(self):
        """Compute curator validation and agreement with authors for all 17
        data type flags using the cur_curdata table.

        Agreement is computed only among papers where the curator has made
        a decision (positive, negative, or curated), not all submitted papers.
        Predicted vs curator values are None until the ABC statistics endpoints are available (SCRUM-6600).
        """
        # AFP flag name -> cur_curdata datatype name mapping
        # Most match, but some differ
        all_flags = {
            "Expression": ("otherexpr", "otherexpr"),
            "Seq. change": ("seqchange", "seqchange"),
            "Genetic int.": ("geneint", "geneint"),
            "Physical int.": ("geneprod", "geneprod"),
            "Regulatory int.": ("genereg", "genereg"),
            "Allele phenotype": ("newmutant", "newmutant"),
            "RNAi phenotype": ("rnai", "rnai"),
            "Overexpr. phenotype": ("overexpr", "overexpr"),
            "Enzymatic activity": ("catalyticact", "catalyticact"),
            "Gene model update": ("structcorr", "structcorr"),
            "Antibody": ("antibody", "antibody"),
            "Site of action": ("siteaction", "siteaction"),
            "Time of action": ("timeaction", "timeaction"),
            "RNAseq": ("rnaseq", "rnaseq"),
            "Chemical phenotype": ("chemphen", "chemphen"),
            "Environmental phenotype": ("envpheno", "envpheno"),
            "Disease": ("humdis", "humandisease"),
        }
        results = {}

        with self.db.afp.get_cursor() as curs:
            # Get all papers with final submissions
            curs.execute(
                "SELECT DISTINCT afp_version.joinkey "
                "FROM afp_version "
                "JOIN afp_lasttouched ON afp_version.joinkey = "
                "afp_lasttouched.joinkey "
                "WHERE afp_version.afp_version = '2'"
            )
            submitted_papers = set(row[0] for row in curs.fetchall())

            for display_name, (afp_flag, cur_flag) in all_flags.items():
                afp_table = "afp_{}".format(afp_flag)

                # Papers where author flagged positive
                curs.execute(
                    "SELECT DISTINCT {t}.joinkey "
                    "FROM {t} "
                    "JOIN afp_version ON {t}.joinkey = afp_version.joinkey "
                    "JOIN afp_lasttouched ON {t}.joinkey = "
                    "afp_lasttouched.joinkey "
                    "WHERE afp_version.afp_version = '2' "
                    "AND {t}.{t} IS NOT NULL AND {t}.{t} != ''".format(
                        t=afp_table
                    )
                )
                author_positive = set(row[0] for row in curs.fetchall())

                # Papers where curator reviewed this datatype (any decision)
                curs.execute(
                    "SELECT DISTINCT cur_paper, cur_curdata FROM cur_curdata "
                    "WHERE cur_datatype = %s",
                    (cur_flag,)
                )
                curator_rows = curs.fetchall()
                curator_reviewed = set(row[0] for row in curator_rows)
                curator_positive = set(
                    row[0] for row in curator_rows
                    if row[1] in ('positive', 'curated')
                )

                # Restrict Author vs Curator to papers where the author
                # actually submitted a form; papers with no submission
                # should not count as "author negative"
                ac_universe = curator_reviewed & submitted_papers
                ac_curator_pos = curator_positive & submitted_papers
                ac_count = len(ac_universe)
                both_positive = len(author_positive & ac_curator_pos)

                # Agreement: among submitted & reviewed papers, how
                # often do author and curator agree?
                agree_count = 0
                for paper in ac_universe:
                    author_yes = paper in author_positive
                    curator_yes = paper in ac_curator_pos
                    if author_yes == curator_yes:
                        agree_count += 1

                accuracy = round(
                    (agree_count / ac_count * 100)
                    if ac_count > 0 else 0, 1
                )

                # Compute precision, recall, F1 for author vs curator
                # (treating curator as ground truth)
                # Among submitted & reviewed papers:
                # TP = both positive, FP = author+ curator-,
                # FN = author- curator+
                tp_ac = both_positive
                fp_ac = len(
                    (author_positive & ac_universe) - ac_curator_pos
                )
                fn_ac = len(
                    ac_curator_pos - author_positive
                )
                precision_ac = round(
                    (tp_ac / (tp_ac + fp_ac) * 100)
                    if (tp_ac + fp_ac) > 0 else 0, 1
                )
                recall_ac = round(
                    (tp_ac / (tp_ac + fn_ac) * 100)
                    if (tp_ac + fn_ac) > 0 else 0, 1
                )
                f1_ac = round(
                    (2 * precision_ac * recall_ac
                     / (precision_ac + recall_ac))
                    if (precision_ac + recall_ac) > 0 else 0, 1
                )

                results[display_name] = {
                    "author_flagged": len(author_positive),
                    "curator_validated": len(ac_curator_pos),
                    "curator_reviewed": ac_count,
                    "both_positive": both_positive,
                    "accuracy_ac": accuracy,
                    "f1_ac": f1_ac,
                    "accuracy_pc": None,
                    "f1_pc": None,
                }
        return results

    @staticmethod
    def _extract_entity_id(entity_str):
        """Extract the bare entity ID from AFP/TFP format.

        AFP/TFP genes: '00006936;%;glp-4' -> '00006936'
        AFP/TFP species: 'Caenorhabditis elegans' -> 'Caenorhabditis elegans'
        """
        if ";%;" in entity_str:
            return entity_str.split(";%;")[0].strip()
        return entity_str.strip()

    def _compute_entity_curator_agreement(self):
        """Compute entity-level curator agreement for genes and species.

        Compares curated entities (from pap_gene/pap_species, filtered to
        manual curation evidence) against author-submitted (AFP) and
        pipeline-extracted (TFP) entities.

        For genes: AFP stores 'NNNNN;%;name', pap_gene stores 'NNNNN'.
        For species: AFP stores full name, pap_species stores taxon ID.
            Uses pap_species_index to map names to taxon IDs.
        """
        results = {}

        with self.db.afp.get_cursor() as curs:
            # Build species name -> taxon ID map
            curs.execute("SELECT joinkey, pap_species_index FROM pap_species_index")
            species_name_to_id = {}
            for taxon_id, name in curs.fetchall():
                if name:
                    species_name_to_id[name.strip().lower()] = taxon_id.strip()

            # Papers with completed gene curation
            curs.execute(
                "SELECT DISTINCT joinkey FROM pap_curation_done "
                "WHERE pap_curation_done = 'genestudied'"
            )
            genes_curation_done = set(
                r[0] for r in curs.fetchall()
            )

            for label, cfg in [
                ("genes", {
                    "tfp_table": "tfp_genestudied",
                    "afp_table": "afp_genestudied",
                    "pap_table": "pap_gene",
                    "pap_col": "pap_gene",
                    "id_transform": "gene_id",
                }),
                ("species", {
                    "tfp_table": "tfp_species",
                    "afp_table": "afp_species",
                    "pap_table": "pap_species",
                    "pap_col": "pap_species",
                    "id_transform": "species_name_to_taxon",
                }),
            ]:
                tfp_t = cfg["tfp_table"]
                afp_t = cfg["afp_table"]

                curs.execute(
                    "SELECT {tfp}.joinkey, {tfp}.{tfp}, {afp}.{afp} "
                    "FROM {tfp} "
                    "JOIN {afp} ON {tfp}.joinkey = {afp}.joinkey "
                    "JOIN afp_version ON {tfp}.joinkey = afp_version.joinkey "
                    "JOIN afp_lasttouched ON {tfp}.joinkey = "
                    "afp_lasttouched.joinkey "
                    "WHERE afp_version.afp_version = '2'".format(
                        tfp=tfp_t, afp=afp_t
                    )
                )
                paper_data = {}
                for joinkey, tfp_val, afp_val in curs.fetchall():
                    # For genes, only include papers with completed
                    # gene curation
                    if (label == "genes"
                            and joinkey not in genes_curation_done):
                        continue
                    raw_extracted = set(
                        e.strip() for e in (tfp_val or "").split(" | ")
                        if e.strip()
                    )
                    raw_submitted = set(
                        e.strip() for e in (afp_val or "").split(" | ")
                        if e.strip()
                    )

                    # Normalize to match pap_* format
                    if cfg["id_transform"] == "gene_id":
                        extracted = set(
                            self._extract_entity_id(e) for e in raw_extracted
                        )
                        submitted = set(
                            self._extract_entity_id(e) for e in raw_submitted
                        )
                    else:
                        # Species: convert name to taxon ID
                        extracted = set()
                        for e in raw_extracted:
                            tid = species_name_to_id.get(e.lower())
                            if tid:
                                extracted.add(tid)
                        submitted = set()
                        for e in raw_submitted:
                            tid = species_name_to_id.get(e.lower())
                            if tid:
                                submitted.add(tid)

                    paper_data[joinkey] = {
                        "extracted": extracted,
                        "submitted": submitted,
                    }

                # Get manually curated entities per paper
                curator_entities = defaultdict(set)
                if paper_data:
                    pap_t = cfg["pap_table"]
                    pap_c = cfg["pap_col"]
                    curs.execute(
                        "SELECT joinkey, {c} FROM {t} "
                        "WHERE (pap_evidence LIKE 'Curator_confirmed%%' "
                        "OR pap_evidence LIKE 'Manually_connected%%') "
                        "AND joinkey IN %s".format(c=pap_c, t=pap_t),
                        (tuple(paper_data.keys()),)
                    )
                    for joinkey, pap_val in curs.fetchall():
                        if pap_val and pap_val.strip():
                            curator_entities[joinkey].add(
                                pap_val.strip()
                            )

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
                    total_afp += len(data["submitted"])
                    total_tfp += len(data["extracted"])
                    curator_agrees_afp += len(curated & data["submitted"])
                    curator_agrees_tfp += len(curated & data["extracted"])

                total_curator = sum(
                    len(v) for k, v in curator_entities.items()
                    if k in paper_data
                )

                # Author vs Curator Jaccard: intersection / union
                union_ac = total_afp + total_curator - curator_agrees_afp
                jaccard_ac = round(
                    (curator_agrees_afp / union_ac * 100)
                    if union_ac > 0 else 0, 1
                )

                # Pipeline vs Curator Jaccard
                union_tc = total_tfp + total_curator - curator_agrees_tfp
                jaccard_tc = round(
                    (curator_agrees_tfp / union_tc * 100)
                    if union_tc > 0 else 0, 1
                )

                results[label] = {
                    "papers_with_curator_data": papers_with_curator,
                    "jaccard_author_curator": jaccard_ac,
                    "jaccard_pipeline_curator": jaccard_tc,
                    "total_curator_entities": total_curator,
                }
        return results

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
                curs.execute(
                    "SELECT {t}.{t} "
                    "FROM {t} "
                    "JOIN afp_version ON {t}.joinkey = afp_version.joinkey "
                    "JOIN afp_lasttouched ON {t}.joinkey = afp_lasttouched.joinkey "
                    "WHERE afp_version.afp_version = '2' "
                    "AND {t}.{t} IS NOT NULL AND {t}.{t} != '' "
                    "AND {t}.{t} != '[]'".format(t=table_name)
                )
                rows = curs.fetchall()

                papers_with_additions = 0
                total_added = 0
                for (val,) in rows:
                    try:
                        items = json.loads(val)
                        if isinstance(items, list):
                            # Filter out placeholder entries with empty name
                            real_items = [
                                item for item in items
                                if isinstance(item, dict)
                                and item.get("name", "").strip()
                            ]
                            if real_items:
                                papers_with_additions += 1
                                total_added += len(real_items)
                    except (json.JSONDecodeError, TypeError):
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

    @staticmethod
    def _determine_role_at_date(pi_dates, lineage_rows, submission_date):
        """Determine a person's role at the time of submission.

        Priority:
        1. Explicit PI (two_pis table)
        2. Supervisor roles (with* prefix in two_lineage) → PI
        3. Direct roles (Phd, Postdoc, etc.) with overlapping date range
        4. Characterize why role is unknown
        """
        if submission_date is None:
            return "No timestamp"
        sub_year = submission_date.year

        # Check explicit PI status
        for pi_ts in pi_dates:
            if pi_ts is None or pi_ts <= submission_date:
                return "PI"

        # Check if person supervised anyone (with* roles) → likely PI
        has_supervisor_role = any(
            role is not None and role.startswith("with")
            for role, _, _ in lineage_rows
        )
        if has_supervisor_role:
            return "PI (estimated)"

        # Map direct two_lineage roles to display labels
        role_map = {
            "Phd": "PhD",
            "Postdoc": "Postdoc",
            "Masters": "Masters",
            "Undergrad": "Undergrad",
            "Research_staff": "Research staff",
            "Lab_visitor": "Lab visitor",
            "Collaborated": "Collaborator",
            "Assistant_professor": "Asst. professor",
            "Sabbatical": "Sabbatical",
            "Highschool": "Highschool",
        }
        has_expired_role = False
        has_unknown_role = False
        for role, date1, date2 in lineage_rows:
            if role is None or role.startswith("with"):
                continue
            if role == "Unknown":
                has_unknown_role = True
                continue
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
            has_expired_role = True

        # Characterize why role could not be determined
        if not lineage_rows and not pi_dates:
            return "No lineage data"
        if has_expired_role:
            return "Expired role"
        if has_unknown_role:
            return "Unknown in database"
        return "Other"

    def _compute_contributor_roles(self):
        """Compute submission counts by contributor role at submission time."""
        with self.db.afp.get_cursor() as curs:
            curs.execute(
                "SELECT afp_contributor.afp_contributor, "
                "afp_contributor.afp_timestamp "
                "FROM afp_contributor "
                "JOIN afp_version ON afp_contributor.joinkey = "
                "afp_version.joinkey "
                "JOIN afp_lasttouched ON afp_contributor.joinkey = "
                "afp_lasttouched.joinkey "
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
                    "FROM two_lineage WHERE joinkey IN %s",
                    (tuple(person_ids),)
                )
                for joinkey, role, d1, d2 in curs.fetchall():
                    lineage_data[joinkey].append((role, d1, d2))

        role_counts = Counter()
        role_people = defaultdict(set)
        for contributor, email_ts in submissions:
            if not contributor or not contributor.strip():
                continue
            person_id = contributor.strip()
            role = self._determine_role_at_date(
                pi_data.get(person_id, []),
                lineage_data.get(person_id, []),
                email_ts,
            )
            role_counts[role] += 1
            role_people[role].add(person_id)

        total = sum(role_counts.values())
        results = {}
        for role in [
            "PI", "PI (estimated)", "Postdoc", "PhD", "Masters",
            "Undergrad", "Research staff", "Lab visitor", "Collaborator",
            "Asst. professor", "Sabbatical", "Highschool",
            "No lineage data", "Expired role", "Unknown in database",
            "No timestamp", "Other",
        ]:
            count = role_counts.get(role, 0)
            results[role] = {
                "submissions": count,
                "percentage": round(
                    count / total * 100 if total > 0 else 0, 1
                ),
                "unique_people": len(role_people.get(role, set())),
            }
        return results

    def _compute_contributor_roles_timeseries(self, bin_period='y'):
        """Compute role distribution over time."""
        with self.db.afp.get_cursor() as curs:
            curs.execute(
                "SELECT afp_contributor.afp_contributor, "
                "afp_contributor.afp_timestamp "
                "FROM afp_contributor "
                "JOIN afp_version ON afp_contributor.joinkey = "
                "afp_version.joinkey "
                "JOIN afp_lasttouched ON afp_contributor.joinkey = "
                "afp_lasttouched.joinkey "
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
                    "FROM two_lineage WHERE joinkey IN %s",
                    (tuple(person_ids),)
                )
                for joinkey, role, d1, d2 in curs.fetchall():
                    lineage_data[joinkey].append((role, d1, d2))

        all_roles = [
            "PI", "PI (estimated)", "Postdoc", "PhD", "Masters",
            "Undergrad", "Research staff", "Lab visitor", "Collaborator",
            "Asst. professor", "Sabbatical", "Highschool",
            "No lineage data", "Expired role", "Unknown in database",
            "No timestamp", "Other",
        ]
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

        result = []
        for period_key in sorted(period_roles.keys()):
            counts = period_roles[period_key]
            result.append([
                period_key,
                {role: counts.get(role, 0) for role in all_roles}
            ])
        return result

    def _compute_entity_curator_timeseries(self, bin_period='y'):
        """Compute entity curator Jaccard per period, binned by author
        submission date."""
        entity_types = {
            "genes": {
                "tfp_table": "tfp_genestudied",
                "afp_table": "afp_genestudied",
                "pap_table": "pap_gene",
                "pap_col": "pap_gene",
            },
            "species": {
                "tfp_table": "tfp_species",
                "afp_table": "afp_species",
                "pap_table": "pap_species",
                "pap_col": "pap_species",
            },
        }

        with self.db.afp.get_cursor() as curs:
            # Species name -> taxon ID map
            curs.execute(
                "SELECT joinkey, pap_species_index "
                "FROM pap_species_index"
            )
            species_map = {
                name.strip().lower(): tid.strip()
                for tid, name in curs.fetchall() if name
            }

            # Papers with completed gene curation
            curs.execute(
                "SELECT DISTINCT joinkey FROM pap_curation_done "
                "WHERE pap_curation_done = 'genestudied'"
            )
            genes_curation_done = set(
                r[0] for r in curs.fetchall()
            )

            period_data = defaultdict(lambda: defaultdict(
                lambda: {
                    "afp": 0, "tfp": 0, "curator": 0,
                    "cur_and_afp": 0, "cur_and_tfp": 0,
                }
            ))

            for label, cfg in entity_types.items():
                tfp_t = cfg["tfp_table"]
                afp_t = cfg["afp_table"]

                curs.execute(
                    "SELECT {tfp}.joinkey, {tfp}.{tfp}, {afp}.{afp}, "
                    "afp_email.afp_timestamp "
                    "FROM {tfp} "
                    "JOIN {afp} ON {tfp}.joinkey = {afp}.joinkey "
                    "JOIN afp_version ON {tfp}.joinkey = "
                    "afp_version.joinkey "
                    "JOIN afp_lasttouched ON {tfp}.joinkey = "
                    "afp_lasttouched.joinkey "
                    "JOIN afp_email ON {tfp}.joinkey = "
                    "afp_email.joinkey "
                    "WHERE afp_version.afp_version = '2'".format(
                        tfp=tfp_t, afp=afp_t
                    )
                )
                paper_rows = curs.fetchall()

                # Get curator entities
                pap_t = cfg["pap_table"]
                pap_c = cfg["pap_col"]
                paper_ids = set(r[0] for r in paper_rows)
                curator_entities = defaultdict(set)
                if paper_ids:
                    curs.execute(
                        "SELECT joinkey, {c} FROM {t} "
                        "WHERE (pap_evidence LIKE "
                        "'Curator_confirmed%%' "
                        "OR pap_evidence LIKE "
                        "'Manually_connected%%') "
                        "AND joinkey IN %s".format(
                            c=pap_c, t=pap_t
                        ),
                        (tuple(paper_ids),)
                    )
                    for jk, val in curs.fetchall():
                        if val and val.strip():
                            curator_entities[jk].add(val.strip())

                for jk, tfp_val, afp_val, email_ts in paper_rows:
                    if email_ts is None:
                        continue
                    # For genes, only include papers with completed
                    # gene curation
                    if (label == "genes"
                            and jk not in genes_curation_done):
                        continue
                    curated = curator_entities.get(jk, set())
                    if not curated:
                        continue

                    pk = (
                        email_ts.strftime('%Y')
                        if bin_period == 'y'
                        else email_ts.strftime('%Y-%m')
                    )

                    # Normalize IDs
                    if label == "genes":
                        afp_set = set(
                            self._extract_entity_id(e)
                            for e in (afp_val or "").split(" | ")
                            if e.strip()
                        )
                        tfp_set = set(
                            self._extract_entity_id(e)
                            for e in (tfp_val or "").split(" | ")
                            if e.strip()
                        )
                    else:
                        afp_set = set()
                        for e in (afp_val or "").split(" | "):
                            e = e.strip()
                            if e:
                                tid = species_map.get(e.lower())
                                if tid:
                                    afp_set.add(tid)
                        tfp_set = set()
                        for e in (tfp_val or "").split(" | "):
                            e = e.strip()
                            if e:
                                tid = species_map.get(e.lower())
                                if tid:
                                    tfp_set.add(tid)

                    d = period_data[pk][label]
                    d["afp"] += len(afp_set)
                    d["tfp"] += len(tfp_set)
                    d["curator"] += len(curated)
                    d["cur_and_afp"] += len(curated & afp_set)
                    d["cur_and_tfp"] += len(curated & tfp_set)

        def avg(vals):
            return round(sum(vals) / len(vals), 1) if vals else 0

        result = {}
        for pk in period_data:
            jac_ac_vals = []
            jac_tc_vals = []
            for label in entity_types:
                d = period_data[pk][label]
                union_ac = d["afp"] + d["curator"] - d["cur_and_afp"]
                union_tc = d["tfp"] + d["curator"] - d["cur_and_tfp"]
                if union_ac > 0:
                    jac_ac_vals.append(
                        d["cur_and_afp"] / union_ac * 100
                    )
                if union_tc > 0:
                    jac_tc_vals.append(
                        d["cur_and_tfp"] / union_tc * 100
                    )
            result[pk] = {
                "jaccard_author_curator": avg(jac_ac_vals),
                "jaccard_pipeline_curator": avg(jac_tc_vals),
            }
        return result

    def _compute_overall_timeseries(self, bin_period='y'):
        """Compute overall accuracy and F1 over time for three pairs.

        Predicted vs Author and Predicted vs Curator: entities only. The flag values are None until the ABC
        statistics endpoints are available (SCRUM-6600).
        Author vs Curator: from flag curator agreement binned by submission date.
        """
        entity_ts = self._compute_confirmation_rates_timeseries(bin_period)

        # Compute entity curator Jaccard per period, binned by submission date
        entity_curator_ts = self._compute_entity_curator_timeseries(
            bin_period
        )

        all_flags = {
            "Expression": ("otherexpr", "otherexpr"),
            "Seq. change": ("seqchange", "seqchange"),
            "Genetic int.": ("geneint", "geneint"),
            "Physical int.": ("geneprod", "geneprod"),
            "Regulatory int.": ("genereg", "genereg"),
            "Allele phenotype": ("newmutant", "newmutant"),
            "RNAi phenotype": ("rnai", "rnai"),
            "Overexpr. phenotype": ("overexpr", "overexpr"),
            "Enzymatic activity": ("catalyticact", "catalyticact"),
            "Gene model update": ("structcorr", "structcorr"),
            "Antibody": ("antibody", "antibody"),
            "Site of action": ("siteaction", "siteaction"),
            "Time of action": ("timeaction", "timeaction"),
            "RNAseq": ("rnaseq", "rnaseq"),
            "Chemical phenotype": ("chemphen", "chemphen"),
            "Environmental phenotype": ("envpheno", "envpheno"),
            "Disease": ("humdis", "humandisease"),
        }

        with self.db.afp.get_cursor() as curs:
            # Get submitted papers with timestamps
            curs.execute(
                "SELECT afp_version.joinkey, afp_email.afp_timestamp "
                "FROM afp_version "
                "JOIN afp_lasttouched ON afp_version.joinkey = "
                "afp_lasttouched.joinkey "
                "JOIN afp_email ON afp_version.joinkey = afp_email.joinkey "
                "WHERE afp_version.afp_version = '2'"
            )
            paper_ts = {
                r[0]: r[1] for r in curs.fetchall() if r[1] is not None
            }

            # Get author positive per flag
            author_pos = {}
            for display_name, (afp_flag, _) in all_flags.items():
                afp_table = "afp_{}".format(afp_flag)
                curs.execute(
                    "SELECT DISTINCT {t}.joinkey FROM {t} "
                    "JOIN afp_version ON {t}.joinkey = afp_version.joinkey "
                    "JOIN afp_lasttouched ON {t}.joinkey = "
                    "afp_lasttouched.joinkey "
                    "WHERE afp_version.afp_version = '2' "
                    "AND {t}.{t} IS NOT NULL AND {t}.{t} != ''".format(
                        t=afp_table
                    )
                )
                author_pos[display_name] = set(
                    r[0] for r in curs.fetchall()
                )

            # Get curator decisions per flag
            curator_pos = {}
            curator_reviewed = {}
            for display_name, (_, cur_flag) in all_flags.items():
                curs.execute(
                    "SELECT DISTINCT cur_paper, cur_curdata "
                    "FROM cur_curdata WHERE cur_datatype = %s",
                    (cur_flag,)
                )
                rows = curs.fetchall()
                curator_reviewed[display_name] = set(
                    r[0] for r in rows
                )
                curator_pos[display_name] = set(
                    r[0] for r in rows
                    if r[1] in ('positive', 'curated')
                )

        def avg(vals):
            return round(sum(vals) / len(vals), 1) if vals else 0

        entity_by_period = {item[0]: item[1] for item in entity_ts}
        paper_periods = {
            jk: ts.strftime('%Y') if bin_period == 'y' else ts.strftime('%Y-%m')
            for jk, ts in paper_ts.items()
        }
        all_periods = set(entity_by_period) | set(paper_periods.values())

        result = []
        for period_key in sorted(all_periods):
            ent = entity_by_period.get(period_key, {})
            period_papers = {jk for jk, pk in paper_periods.items() if pk == period_key}

            # Author vs Curator (among papers in this period)
            ac_agree_counts = []
            ac_f1_vals = []
            for display_name in all_flags:
                reviewed_in_period = (
                    curator_reviewed[display_name] & period_papers
                )
                if not reviewed_in_period:
                    continue
                a_pos = author_pos[display_name] & period_papers
                c_pos = curator_pos[display_name] & period_papers
                tp = len(a_pos & c_pos & reviewed_in_period)
                agree = sum(
                    1 for p in reviewed_in_period
                    if (p in a_pos) == (p in c_pos)
                )
                acc = agree / len(reviewed_in_period) * 100
                fp = len(
                    (a_pos & reviewed_in_period) - c_pos
                )
                fn = len(
                    (c_pos & reviewed_in_period) - a_pos
                )
                prec = (tp / (tp + fp) * 100) if (tp + fp) > 0 else 0
                rec = (tp / (tp + fn) * 100) if (tp + fn) > 0 else 0
                f1 = (
                    2 * prec * rec / (prec + rec)
                ) if (prec + rec) > 0 else 0
                ac_agree_counts.append(acc)
                ac_f1_vals.append(f1)

            # Entity timeseries returns plain Jaccard floats
            ent_jaccard_vals = [
                v for v in ent.values()
                if isinstance(v, (int, float))
            ]

            result.append([period_key, {
                "entities_pred_vs_author_jaccard": avg(ent_jaccard_vals),
                "entities_author_vs_curator_jaccard": (
                    entity_curator_ts.get(period_key, {})
                    .get("jaccard_author_curator", 0)
                ),
                "entities_pred_vs_curator_jaccard": (
                    entity_curator_ts.get(period_key, {})
                    .get("jaccard_pipeline_curator", 0)
                ),
                "flags_pred_vs_author_accuracy": None,
                "flags_pred_vs_author_f1": None,
                "flags_author_vs_curator_accuracy": avg(ac_agree_counts),
                "flags_author_vs_curator_f1": avg(ac_f1_vals),
                "flags_pred_vs_curator_accuracy": None,
                "flags_pred_vs_curator_f1": None,
            }])
        return result

    def _compute_overall_agreement(self):
        """Compute stats for overview cards, split by entities and flags.

        The flag values involving the classifiers are None until the ABC statistics endpoints are available
        (SCRUM-6600).
        """
        entity_rates = self._compute_entity_confirmation_rates()
        entity_jaccard_pa = [
            entity_rates[k]["jaccard_pred_author"]
            for k in entity_rates
            if entity_rates[k]["total_extracted"] > 0
        ]

        entity_curator = self._compute_entity_curator_agreement()
        entity_jaccard_ac = [
            entity_curator[k]["jaccard_author_curator"]
            for k in entity_curator
            if entity_curator[k]["papers_with_curator_data"] > 0
        ]
        entity_jaccard_tc = [
            entity_curator[k]["jaccard_pipeline_curator"]
            for k in entity_curator
            if entity_curator[k]["papers_with_curator_data"] > 0
        ]

        flag_curator = self._compute_data_type_flags_curator_agreement()
        flag_acc_ac = [
            flag_curator[k]["accuracy_ac"]
            for k in flag_curator
            if flag_curator[k].get("curator_reviewed", 0) > 0
        ]
        flag_f1_ac = [
            flag_curator[k]["f1_ac"]
            for k in flag_curator
            if flag_curator[k].get("curator_reviewed", 0) > 0
        ]

        def avg(vals):
            return round(sum(vals) / len(vals), 1) if vals else 0

        return {
            "entities": {
                "predicted_vs_author": avg(entity_jaccard_pa),
                "author_vs_curator": avg(entity_jaccard_ac),
                "predicted_vs_curator": avg(entity_jaccard_tc),
            },
            "flags": {
                "predicted_vs_author_accuracy": None,
                "predicted_vs_author_f1": None,
                "author_vs_curator_accuracy": avg(flag_acc_ac),
                "author_vs_curator_f1": avg(flag_f1_ac),
                "predicted_vs_curator_accuracy": None,
                "predicted_vs_curator_f1": None,
            },
            "classifier_stats_unavailable": CLASSIFIER_STATS_WARNING,
        }

    def on_post(self, req, resp, req_type):
        with self.db:
            stats_req_types = {
                "stats_totals", "papers", "contributors", "most_emailed",
                "all_papers", "entities_count", "paper_stats",
                "stats_timeseries", "stats_kpi", "time_to_submit",
                "entity_confirmation_rates", "data_type_flags_stats",
                "confirmation_rates_timeseries",
                "data_type_flags_confusion_matrix",
                "data_type_flags_curator_agreement",
                "entity_curator_agreement",
                "manually_added_entities_stats",
                "contributor_roles", "contributor_roles_timeseries",
                "data_type_flags_accuracy_timeseries",
                "overall_agreement",
                "overall_timeseries",
            }
            if req_type not in stats_req_types:
                if "paper_id" not in req.media:
                    raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                paper_id = req.media["paper_id"]
                if req_type == "status":
                    paper = WBPaper(paper_id=paper_id, db_manager=self.db.paper)
                    paper.load_bib_info()
                    afp_processed = self.db.afp.paper_is_afp_processed(paper_id)
                    afp_processed_date = self.db.afp.get_processed_date(paper_id)
                    author_submitted = self.db.afp.author_has_submitted(paper_id)
                    author_modified = self.db.afp.author_has_modified(paper_id)
                    afp_form_link = self.db.afp.get_afp_form_link(paper_id, self.afp_base_url)
                    title = paper.title.replace("\"", "'")
                    journal = paper.journal
                    email = self.db.afp.get_contact_emails(paper_id)
                    pmid = paper.pmid
                    doi = paper.doi
                    # Check if paper is from old AFP system (no entry in afp_version table)
                    afp_version_exists = self.db._get_single_field(paper_id, "afp_version")
                    is_old_afp = author_submitted and afp_version_exists is None
                    resp.body = '{{"title": "{}", "journal": "{}", "email": "{}", "afp_processed": {}, ' \
                                '"author_submitted": {}, "author_modified": {}, "afp_form_link": "{}", "pmid": "{}", ' \
                                '"doi": "{}", "afp_processed_date": "{}", "is_old_afp": {}}}'.format(
                        title, journal, email,
                        "true" if afp_processed else "false", "true" if author_submitted else "false", 
                        "true" if author_modified else "false", afp_form_link, pmid, doi, afp_processed_date,
                        "true" if is_old_afp else "false")
                    resp.status = falcon.HTTP_200
                elif req_type == "lists":
                    resp.body = json.dumps(self.get_all_lists(paper_id))
                    resp.status = falcon.HTTP_200
                elif req_type == "flagged":
                    flagged_dict = self.get_all_flagged_data_types(paper_id)
                    # the values are sent as strings ("True", "False", "null"), as the frontend expects
                    resp.body = json.dumps({key: value if key.endswith("_details") else str(value)
                                            for key, value in flagged_dict.items()})
                    resp.status = falcon.HTTP_200
                elif req_type == "other_yn":
                    other_yn = self.get_all_yes_no_data_types(paper_id)
                    resp.body = '{{"afp_modchange_checked": "{}", "afp_modchange_details": {}, ' \
                                '"afp_newantibody_checked": "{}", "afp_newantibody_details": {}, ' \
                                '"afp_siteaction_checked": "{}", "afp_siteaction_details": {}, ' \
                                '"afp_timeaction_checked": "{}", "afp_timeaction_details": {}, ' \
                                '"afp_chemphen_checked": "{}", "afp_chemphen_details": {}, ' \
                                '"afp_envpheno_checked": "{}", "afp_envpheno_details": {}, ' \
                                '"afp_humdis_checked": "{}", "afp_humdis_details": {}, ' \
                                '"afp_othergenefunc_checked": "{}", ' \
                                '"afp_othergenefunc_details": {}}}'.format(
                                            other_yn["afp_modchange_checked"], json.dumps(other_yn["afp_modchange_details"]),
                                            other_yn["afp_newantibody_checked"], json.dumps(other_yn["afp_newantibody_details"]),
                                            other_yn["afp_siteaction_checked"], json.dumps(other_yn["afp_siteaction_details"]),
                                            other_yn["afp_timeaction_checked"], json.dumps(other_yn["afp_timeaction_details"]),
                                            other_yn["afp_chemphen_checked"], json.dumps(other_yn["afp_chemphen_details"]),
                                            other_yn["afp_envpheno_checked"], json.dumps(other_yn["afp_envpheno_details"]),
                                            other_yn["afp_humdis_checked"], json.dumps(other_yn["afp_humdis_details"]),
                                            other_yn["afp_othergenefunc_checked"],
                                            json.dumps(other_yn["afp_othergenefunc_details"]))
                    resp.status = falcon.HTTP_200
                elif req_type == "others":
                    others = self.get_other_data_types(paper_id)
                    resp.body = '{{"afp_newalleles": {}, "afp_newstrains": {}, "afp_newtransgenes": {}, ' \
                                '"afp_otherantibodies": {}, "afp_newspecies": {}}}'.format(
                        json.dumps(others["afp_newalleles"]), json.dumps(others["afp_newstrains"]),
                        json.dumps(others["afp_newtransgenes"]), json.dumps(others["afp_otherantibodies"]),
                        json.dumps(others["afp_newspecies"]))
                    resp.status = falcon.HTTP_200
                elif req_type == "comments":
                    comments = json.dumps(self.db._get_single_field(paper_id, "afp_comment"))
                    resp.body = '{{"afp_comments": {}}}'.format(comments)
                    resp.status = falcon.HTTP_200
                elif req_type == "converted_text":
                    fulltext, sentences, counters, classes = self.get_text_from_pdfs(paper_id)
                    sentences = ["\"" + sentence + "\"" for sentence in sentences]
                    resp.body = (f'{{"fulltext": "{fulltext}", "sentences": [{", ".join(sentences)}],'
                                 f' "counters": {counters}, "classes": {classes}}}')
                    resp.status = falcon.HTTP_200
                else:
                    raise falcon.HTTPError(falcon.HTTP_NOT_FOUND)
            else:
                if req_type == "stats_totals":
                    num_no_submission = self.db.afp.get_paper_ids_afp_no_submission(count=True)
                    num_full_submission = self.db.afp.get_paper_ids_afp_full_submission(count=True)
                    num_partial_submission = self.db.afp.get_paper_ids_afp_partial_submission(count=True)
                    num_processed = num_no_submission

                    num_papers_old_afp_processed = self.db.afp.get_num_papers_old_afp_processed()
                    num_papers_old_afp_author_submitted = self.db.afp.get_num_papers_old_afp_author_submitted()

                    resp.body = '{{"num_papers_new_afp_processed": "{}", "num_papers_old_afp_processed": "{}", ' \
                                '"num_papers_new_afp_author_submitted": "{}", "num_papers_old_afp_author_submitted": ' \
                                '"{}", "num_papers_new_afp_partial_sub": "{}"}}'\
                        .format(num_processed, num_papers_old_afp_processed,
                                num_full_submission, num_papers_old_afp_author_submitted,
                                num_partial_submission)
                    resp.status = falcon.HTTP_200
                elif req_type == "paper_stats":
                    num_extracted_genes_per_paper = self.db.afp.get_num_entities_per_paper("genestudied")
                    num_extracted_species_per_paper = self.db.afp.get_num_entities_per_paper("species")
                    num_extracted_alleles_per_paper = self.db.afp.get_num_entities_per_paper("variation")
                    num_extracted_strains_per_paper = self.db.afp.get_num_entities_per_paper("strain")
                    num_extracted_transgenes_per_paper = self.db.afp.get_num_entities_per_paper("transgene")
                    resp.body = '{{"num_extracted_genes_per_paper": {}, "num_extracted_species_per_paper": {}, ' \
                                '"num_extracted_alleles_per_paper": {}, "num_extracted_strains_per_paper": {}, ' \
                                '"num_extracted_transgenes_per_paper": {}}}'.format(
                        num_extracted_genes_per_paper, num_extracted_species_per_paper,
                        num_extracted_alleles_per_paper, num_extracted_strains_per_paper,
                        num_extracted_transgenes_per_paper)
                    resp.status = falcon.HTTP_200
                elif req_type == "papers":
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    list_type = req.media["list_type"]
                    # the automated datatype filters read cur_blackbox: disabled until SCRUM-6599. For the submitted
                    # list they filter on the authors' answers (wbtools merges them into the manual filters).
                    classification_filters_available = list_type == "submitted"
                    svm_filters = req.media["svm_filters"].split(",") if classification_filters_available else None
                    manual_filters = req.media["manual_filters"].split(",")
                    curation_filters = req.media["curation_filters"].split(",")
                    combine_filters = req.media["combine_filters"]
                    if list_type == "processed":
                        num_papers = self.db.afp.get_paper_ids_afp_no_submission(
                                                 must_be_autclass_positive_data_types=svm_filters,
                                                 must_be_positive_manual_flag_data_types=manual_filters,
                                                 must_be_curation_negative_data_types=curation_filters,
                                                 combine_filters=combine_filters, count=True,
                                                 tazendra_user=self.tazendra_username,
                                                 tazendra_password=self.tazendra_password)
                        ids = self.db.afp.get_paper_ids_afp_no_submission(
                                                 must_be_autclass_positive_data_types=svm_filters,
                                                 must_be_positive_manual_flag_data_types=manual_filters,
                                                 must_be_curation_negative_data_types=curation_filters,
                                                 combine_filters=combine_filters,
                                                 offset=from_offset,
                                                 limit=count,
                                                 tazendra_user=self.tazendra_username,
                                                 tazendra_password=self.tazendra_password)
                        pap_titles = {}
                        for paper_id in ids:
                            paper_obj = WBPaper(paper_id=paper_id, db_manager=self.db.paper)
                            paper_obj.load_bib_info()
                            pap_titles[paper_id] = paper_obj.title.replace("\"", "'")
                        #pap_titles = self.db.paper.get_papers_titles(paper_ids=ids) if ids else []
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             pap_titles[pap_id] + "\"}" for pap_id in ids])
                    elif list_type == "submitted":
                        num_papers = self.db.afp.get_paper_ids_afp_full_submission(
                            must_be_autclass_positive_data_types=svm_filters,
                            must_be_positive_manual_flag_data_types=manual_filters,
                            must_be_curation_negative_data_types=curation_filters,
                            combine_filters=combine_filters, count=True, tazendra_user=self.tazendra_username,
                            tazendra_password=self.tazendra_password)
                        ids = self.db.afp.get_paper_ids_afp_full_submission(
                            must_be_autclass_positive_data_types=svm_filters,
                            must_be_positive_manual_flag_data_types=manual_filters,
                            must_be_curation_negative_data_types=curation_filters,
                            combine_filters=combine_filters,
                            offset=from_offset,
                            limit=count, tazendra_user=self.tazendra_username,
                            tazendra_password=self.tazendra_password)
                        pap_titles = {}
                        for paper_id in ids:
                            paper_obj = WBPaper(paper_id=paper_id, db_manager=self.db.paper)
                            paper_obj.load_bib_info()
                            pap_titles[paper_id] = paper_obj.title.replace("\"", "'")
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             pap_titles[pap_id] + "\"}" for pap_id in ids])
                    elif list_type == "partial":
                        num_papers = self.db.afp.get_paper_ids_afp_partial_submission(
                            must_be_autclass_positive_data_types=svm_filters,
                            must_be_positive_manual_flag_data_types=manual_filters,
                            must_be_curation_negative_data_types=curation_filters,
                            combine_filters=combine_filters, count=True, tazendra_user=self.tazendra_username,
                            tazendra_password=self.tazendra_password)
                        ids = self.db.afp.get_paper_ids_afp_partial_submission(
                            must_be_autclass_positive_data_types=svm_filters,
                            must_be_positive_manual_flag_data_types=manual_filters,
                            must_be_curation_negative_data_types=curation_filters,
                            combine_filters=combine_filters,
                            offset=from_offset,
                            limit=count, tazendra_user=self.tazendra_username,
                            tazendra_password=self.tazendra_password)
                        pap_titles = {}
                        for paper_id in ids:
                            paper_obj = WBPaper(paper_id=paper_id, db_manager=self.db.paper)
                            paper_obj.load_bib_info()
                            pap_titles[paper_id] = paper_obj.title.replace("\"", "'")
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             pap_titles[pap_id] + "\"}" for pap_id in ids])
                    elif list_type == "empty":
                        num_papers = self.db.afp.get_num_papers_no_entities()
                        list_ids = ",".join(["{\"paper_id\":\"" + pap_id + "\",\"title\":\"" +
                                             self.db.paper.get_paper_title(pap_id) + "\"}" for pap_id in
                                             self.db.afp.get_list_papers_no_entities(from_offset, count)])
                    else:
                        raise falcon.HTTPError(falcon.HTTP_BAD_REQUEST)
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}, ' \
                                '"classification_filters_available": {}}}'.format(
                        list_ids, num_papers, "true" if classification_filters_available else "false")
                    resp.status = falcon.HTTP_200

                elif req_type == "all_papers":
                    list_type = req.media["list_type"]
                    # the automated datatype filters read cur_blackbox: disabled until SCRUM-6599. For the submitted
                    # list they filter on the authors' answers (wbtools merges them into the manual filters).
                    classification_filters_available = list_type == "submitted"
                    svm_filters = req.media["svm_filters"].split(",") if classification_filters_available else None
                    manual_filters = req.media["manual_filters"].split(",")
                    curation_filters = req.media["curation_filters"].split(",")
                    combine_filters = req.media["combine_filters"]
                    if list_type == "processed":
                        all_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                            self.db.afp.get_paper_ids_afp_no_submission(
                                                must_be_autclass_positive_data_types=svm_filters,
                                                must_be_positive_manual_flag_data_types=manual_filters,
                                                must_be_curation_negative_data_types=curation_filters,
                                                combine_filters=combine_filters,
                                                offset=None, limit=None, tazendra_user=self.tazendra_username,
                                                tazendra_password=self.tazendra_password)])
                    elif list_type == "submitted":
                        all_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                            self.db.afp.get_paper_ids_afp_full_submission(
                                                must_be_autclass_positive_data_types=svm_filters,
                                                must_be_positive_manual_flag_data_types=manual_filters,
                                                must_be_curation_negative_data_types=curation_filters,
                                                combine_filters=combine_filters,
                                                offset=None, limit=None, tazendra_user=self.tazendra_username,
                                                tazendra_password=self.tazendra_password)])
                    elif list_type == "partial":
                        all_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                            self.db.afp.get_paper_ids_afp_partial_submission(
                                                must_be_autclass_positive_data_types=svm_filters,
                                                must_be_positive_manual_flag_data_types=manual_filters,
                                                must_be_curation_negative_data_types=curation_filters,
                                                combine_filters=combine_filters,
                                                offset=None, limit=None, tazendra_user=self.tazendra_username,
                                                tazendra_password=self.tazendra_password)])
                    elif list_type == "empty":
                        all_ids = ",".join(["\"" + pap_id + "\"" for pap_id in
                                            self.db.afp.get_list_papers_no_entities(0, 0)])
                    resp.body = '{{"all_ids": [{}]}}'.format(all_ids)
                    resp.status = falcon.HTTP_200

                elif req_type == "contributors":
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    num_contrib = self.db.afp.get_num_contributors()
                    list_contrib = ",".join(["{\"name\":\"" + self.db.person.get_fullname_from_personid(self.db.person.get_person_id_from_email_address(contrib[0])) +
                                             "\",\"email\":\"" + contrib[0] +
                                             "\",\"count\":\"" + str(contrib[1]) + "\"}"
                                             for contrib in self.db.afp.get_list_contributors_with_numbers(from_offset,
                                                                                                           count)])
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(list_contrib, num_contrib)
                    resp.status = falcon.HTTP_200

                elif req_type == "most_emailed":
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    num_emailed = self.db.afp.get_num_unique_emailed_addresses()
                    list_emailed = ",".join(["{\"name\":\"" + self.db.person.get_fullname_from_personid(self.db.person.get_person_id_from_email_address(emailed[0])) +
                                             "\",\"email\":\"" + emailed[0] +
                                             "\",\"count\":\"" + str(emailed[1]) + "\"}"
                                             for emailed in self.db.afp.get_emailed_authors_with_count(from_offset, count)])
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(list_emailed, num_emailed)
                    resp.status = falcon.HTTP_200

                elif req_type == "entities_count":
                    entity_type = req.media["entity_type"]
                    if entity_type == "gene":
                        entity_type = EntityType.GENE
                    elif entity_type == "species":
                        entity_type = EntityType.SPECIES
                    elif entity_type == "strain":
                        entity_type = EntityType.STRAIN
                    elif entity_type == "transgenes":
                        entity_type = EntityType.TRANSGENE
                    elif entity_type == "variation":
                        entity_type = EntityType.VARIATION
                    added = bool(req.media["added"])
                    from_offset = req.media["from"]
                    count = req.media["count"]
                    sorted_list, total_len = self.db.afp.get_author_modified_entities_with_counter(
                        entity_type=entity_type, added=added, limit=count, offset=from_offset)
                    list_entities = ",".join(["{\"name\":\"" + elem[1] + "\",\"id\":\"" + elem[2] +
                                             "\",\"count\":\"" + str(elem[0]) + "\"}" for elem in sorted_list])
                    resp.body = '{{"list_elements": [{}], "total_num_elements": {}}}'.format(list_entities, total_len)
                    resp.status = falcon.HTTP_200

                elif req_type == "stats_timeseries":
                    bin_size = req.media["bin_size"]
                    stats_ts = self.db.afp.get_stats_timeseries(bin_period=bin_size)
                    resp.body = json.dumps(stats_ts)
                    resp.status = falcon.HTTP_200

                elif req_type == "stats_kpi":
                    num_no_submission = self.db.afp.get_paper_ids_afp_no_submission(count=True)
                    num_full_submission = self.db.afp.get_paper_ids_afp_full_submission(count=True)
                    num_partial_submission = self.db.afp.get_paper_ids_afp_partial_submission(count=True)
                    total_processed = num_no_submission + num_full_submission + num_partial_submission
                    response_rate = round(
                        (num_full_submission / total_processed * 100) if total_processed > 0 else 0, 1
                    )
                    num_contributors = self.db.afp.get_num_contributors()

                    with self.db.afp.get_cursor() as curs:
                        curs.execute(
                            "SELECT AVG(days) FROM ("
                            "SELECT (CAST(afp_lasttouched.afp_lasttouched AS BIGINT) - "
                            "EXTRACT(EPOCH FROM afp_email.afp_timestamp)) / 86400.0 AS days "
                            "FROM afp_lasttouched "
                            "JOIN afp_version ON afp_lasttouched.joinkey = afp_version.joinkey "
                            "JOIN afp_email ON afp_lasttouched.joinkey = afp_email.joinkey "
                            "WHERE afp_version.afp_version = '2'"
                            ") sub WHERE days >= 0"
                        )
                        avg_days_result = curs.fetchone()
                    avg_time_to_submit = (
                        round(float(avg_days_result[0]), 1)
                        if avg_days_result and avg_days_result[0] else 0
                    )

                    resp.body = json.dumps({
                        "total_processed": total_processed,
                        "response_rate": response_rate,
                        "avg_time_to_submit_days": avg_time_to_submit,
                        "papers_awaiting": num_no_submission,
                        "unique_contributors": num_contributors,
                        "full_submissions": num_full_submission,
                        "partial_submissions": num_partial_submission
                    })
                    resp.status = falcon.HTTP_200

                elif req_type == "time_to_submit":
                    bin_size = (req.media or {}).get("bin_size", "y")
                    with self.db.afp.get_cursor() as curs:
                        curs.execute(
                            "SELECT "
                            "(CAST(afp_lasttouched.afp_lasttouched AS BIGINT) - "
                            "EXTRACT(EPOCH FROM afp_email.afp_timestamp)) / 86400.0, "
                            "afp_email.afp_timestamp "
                            "FROM afp_lasttouched "
                            "JOIN afp_version ON afp_lasttouched.joinkey = afp_version.joinkey "
                            "JOIN afp_email ON afp_lasttouched.joinkey = afp_email.joinkey "
                            "WHERE afp_version.afp_version = '2'"
                        )
                        rows = curs.fetchall()
                    period_data = defaultdict(list)
                    for days_val, email_ts in rows:
                        if days_val is None or email_ts is None:
                            continue
                        days = float(days_val)
                        if days < 0:
                            continue
                        if bin_size == 'y':
                            period_key = email_ts.strftime('%Y')
                        else:
                            period_key = email_ts.strftime('%Y-%m')
                        period_data[period_key].append(days)
                    result = []
                    for period_key in sorted(period_data.keys()):
                        vals = period_data[period_key]
                        avg = round(sum(vals) / len(vals), 1) if vals else 0
                        result.append([period_key, avg, len(vals)])
                    resp.body = json.dumps(result)
                    resp.status = falcon.HTTP_200

                elif req_type == "entity_confirmation_rates":
                    results = self._compute_entity_confirmation_rates()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200

                elif req_type == "data_type_flags_stats":
                    flag_tables = {
                        "Expression": "afp_otherexpr",
                        "Seq. change": "afp_seqchange",
                        "Genetic int.": "afp_geneint",
                        "Physical int.": "afp_geneprod",
                        "Regulatory int.": "afp_genereg",
                        "Allele phenotype": "afp_newmutant",
                        "RNAi phenotype": "afp_rnai",
                        "Overexpr. phenotype": "afp_overexpr",
                        "Gene model update": "afp_structcorr",
                        "Antibody": "afp_antibody",
                        "Site of action": "afp_siteaction",
                        "Time of action": "afp_timeaction",
                        "RNAseq": "afp_rnaseq",
                        "Chemical phenotype": "afp_chemphen",
                        "Environmental phenotype": "afp_envpheno",
                        "Enzymatic activity": "afp_catalyticact",
                        "Disease": "afp_humdis"
                    }
                    flag_counts = {}
                    with self.db.afp.get_cursor() as curs:
                        for display_name, table_name in flag_tables.items():
                            col_name = table_name
                            curs.execute(
                                "SELECT COUNT(DISTINCT {t}.joinkey) "
                                "FROM {t} "
                                "JOIN afp_lasttouched ON {t}.joinkey = afp_lasttouched.joinkey "
                                "JOIN afp_version ON {t}.joinkey = afp_version.joinkey "
                                "WHERE afp_version.afp_version = '2' "
                                "AND {t}.{c} IS NOT NULL AND {t}.{c} != ''".format(
                                    t=table_name, c=col_name
                                )
                            )
                            result = curs.fetchone()
                            flag_counts[display_name] = int(result[0]) if result else 0
                    resp.body = json.dumps(flag_counts)
                    resp.status = falcon.HTTP_200

                elif req_type == "confirmation_rates_timeseries":
                    bin_size = (req.media or {}).get("bin_size", "y")
                    result = self._compute_confirmation_rates_timeseries(bin_size)
                    resp.body = json.dumps(result)
                    resp.status = falcon.HTTP_200

                elif req_type in ("data_type_flags_confusion_matrix", "data_type_flags_accuracy_timeseries"):
                    resp.body = json.dumps(CLASSIFIER_STATS_UNAVAILABLE)
                    resp.status = falcon.HTTP_200

                elif req_type == "data_type_flags_curator_agreement":
                    results = self._compute_data_type_flags_curator_agreement()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200

                elif req_type == "entity_curator_agreement":
                    results = self._compute_entity_curator_agreement()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200

                elif req_type == "manually_added_entities_stats":
                    results = self._compute_manually_added_entities_stats()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200

                elif req_type == "contributor_roles":
                    results = self._compute_contributor_roles()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200

                elif req_type == "contributor_roles_timeseries":
                    bin_size = (req.media or {}).get("bin_size", "y")
                    results = self._compute_contributor_roles_timeseries(
                        bin_size
                    )
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200

                elif req_type == "overall_agreement":
                    results = self._compute_overall_agreement()
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200

                elif req_type == "overall_timeseries":
                    bin_size = (req.media or {}).get("bin_size", "y")
                    results = self._compute_overall_timeseries(bin_size)
                    resp.body = json.dumps(results)
                    resp.status = falcon.HTTP_200
