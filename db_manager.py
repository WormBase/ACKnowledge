import html
import json
import logging
from collections import defaultdict
from typing import List

import psycopg2
import urllib.request
from urllib.parse import quote
import re
import time


AFP_ENTITIES_SEPARATOR = " | "
AFP_IDS_SEPARATOR = ";%;"
PAP_AFP_EVIDENCE_CODE = "Inferred_automatically \"from author first pass afp_genestudied\""
TAZENDRA_PDFS_LOCATION = "http://tazendra.caltech.edu/~acedb/daniel/"


logger = logging.getLogger(__name__)


class DBManager(object):
    
    def __init__(self, dbname, user, password, host):
        connection_str = "dbname='" + dbname
        if user:
            connection_str += "' user='" + user
        if password:
            connection_str += "' password='" + password
        connection_str += "' host='" + host + "'"
        self.conn = psycopg2.connect(connection_str)
        self.cur = self.conn.cursor()

    def close(self):
        self.conn.commit()
        self.cur.close()
        self.conn.close()

    def get_set_of_curatable_papers(self):
        """
        get the set of curatable papers (i.e., papers that can be processed by AFP - type must be 'primary' or pap_type
        equal to 1).

        Returns:
            Set[str]: the set of curatable papers
        """
        self.cur.execute("SELECT * FROM pap_primary_data WHERE pap_primary_data = 'primary'")
        rows = self.cur.fetchall()
        curatable_papers = [row[0] for row in rows]
        self.cur.execute("SELECT * FROM pap_type WHERE pap_type = '1'")
        rows = self.cur.fetchall()
        curatable_papers.extend([row[0] for row in rows])
        return set(curatable_papers)

    def get_set_of_afp_processed_papers(self):
        """
        get the set of papers that have already been processed by AFP

        Returns:
            Set[str]: the set of papers that have already been processed
        """
        self.cur.execute("SELECT * FROM afp_passwd")
        rows = self.cur.fetchall()
        processed_papers = [row[0] for row in rows]
        return set(processed_papers)

    def get_paper_id_from_passwd(self, passwd):
        """
        get a paper id from a password

        Args:
            passwd(str): the password
        Returns:
            str: the paper id, if the password is valid, None otherwise
        """
        self.cur.execute("SELECT * FROM afp_passwd WHERE afp_passwd = '{}'".format(passwd))
        res = self.cur.fetchone()
        if res:
            return res[0]
        else:
            return None
    
    def get_svm_flagged_papers(self):
        """
        get the list of SVM flagged papers with their values

        Returns:
            Dict[Dict[Bool]: a dictionary with papers ids as keys and, as values, dictionaries with data type as key
            and a bool values indicating if the paper is SVM positive or negative for each specific data type
        """
        self.cur.execute("SELECT A.cur_paper, A.cur_datatype, A.cur_svmdata \n"
                         "FROM cur_svmdata A \n"
                         "INNER JOIN (\n"
                         "    SELECT cur_paper, cur_datatype, MAX(CAST(cur_date as date)) AS max_date \n"
                         "    FROM cur_svmdata \n"
                         "    GROUP BY cur_paper, cur_datatype) B \n"
                         "ON A.cur_paper = B.cur_paper AND A.cur_datatype = B.cur_datatype")
        rows = self.cur.fetchall()
        papers_svm_flags = defaultdict(lambda: defaultdict(bool))
        for row in rows:
            papers_svm_flags[row[0]][row[1]] = row[2] != "NEG" and row[2] != "low"
        return papers_svm_flags

    def get_all_genes(self):
        genes_names = set()
        self.cur.execute("SELECT * FROM gin_locus WHERE joinkey != ''")
        rows = self.cur.fetchall()
        for row in rows:
            genes_names.add(row[1])
        self.cur.execute("SELECT * FROM gin_wbgene WHERE joinkey != ''")
        rows = self.cur.fetchall()
        for row in rows:
            genes_names.add(row[1])
        self.cur.execute("SELECT * FROM gin_seqname WHERE joinkey != ''")
        rows = self.cur.fetchall()
        for row in rows:
            genes_names.add(row[1])
        return list(genes_names)

    def get_all_alleles(self):
        self.cur.execute("SELECT obo_name_variation.obo_name_variation FROM obo_name_variation JOIN obo_data_variation "
                         "ON obo_name_variation.joinkey = obo_data_variation.joinkey "
                         "WHERE obo_data_variation LIKE '%status: \"Live\"%' AND obo_name_variation.joinkey != ''")
        rows = self.cur.fetchall()
        return [row[0] for row in rows]

    def get_all_strains(self):
        """
        get the list of all strains from the DB

        Returns:
            List[str]: the list of strains
        """
        self.cur.execute("SELECT * FROM obo_name_strain")
        rows = self.cur.fetchall()
        return [row[1] for row in rows]

    def get_all_transgenes(self):
        """
        get the list of all transgenes and their synonyms from the DB

        Returns:
            List[str]: the list of transgenes and synonyms
        """
        self.cur.execute("SELECT * FROM trp_publicname")
        rows = self.cur.fetchall()
        transgenes = [row[1] for row in rows]
        self.cur.execute("SELECT * FROM trp_synonym")
        rows = self.cur.fetchall()
        transgenes.extend([synonym for row in rows for synonym in row[1].split(AFP_ENTITIES_SEPARATOR) if synonym and
                           synonym[0] != "[" and synonym[-1] != "]"])
        return transgenes

    def get_gene_name_id_map(self):
        """
        get a map that returns the id of a gene given its symbol

        Returns:
            Dict[str, str]: the map between gene symbol and id
        """
        gene_name_id_map = {}
        self.cur.execute("SELECT * FROM gin_locus WHERE joinkey != ''")
        rows = self.cur.fetchall()
        gene_name_id_map.update({row[1]: row[0] for row in rows})
        self.cur.execute("SELECT * FROM gin_synonyms WHERE joinkey != ''")
        rows = self.cur.fetchall()
        gene_name_id_map.update({row[1]: row[0] for row in rows})
        self.cur.execute("SELECT * FROM gin_wbgene WHERE joinkey != ''")
        rows = self.cur.fetchall()
        gene_name_id_map.update({row[1]: row[0] for row in rows})
        self.cur.execute("SELECT * FROM gin_seqname WHERE joinkey != ''")
        rows = self.cur.fetchall()
        gene_name_id_map.update({row[1]: row[0] for row in rows})
        return gene_name_id_map

    def get_gene_cgc_name_from_id_map(self):
        gene_cgc_name_from_id_map = {}
        self.cur.execute("SELECT * FROM gin_locus WHERE joinkey != ''")
        rows = self.cur.fetchall()
        gene_cgc_name_from_id_map.update({row[0]: row[1] for row in rows})
        self.cur.execute("SELECT * FROM gin_synonyms WHERE joinkey != ''")
        rows = self.cur.fetchall()
        for row in rows:
            if row[0] not in gene_cgc_name_from_id_map:
                gene_cgc_name_from_id_map[row[0]] = row[1]
        return gene_cgc_name_from_id_map

    def get_allele_name_id_map(self):
        """
        get a map that returns the id of an allele given its symbol

        Returns:
            Dict[str, str]: the map between allele symbol and id
        """
        self.cur.execute("SELECT * FROM obo_name_variation WHERE joinkey != ''")
        rows = self.cur.fetchall()
        return {row[1]: row[0] for row in rows}

    def get_paper_title(self, paper_id):
        """
        get paper title

        Args:
            paper_id: the id of the paper
        Returns:
            str: the title of the paper
        """
        self.cur.execute("SELECT * FROM pap_title WHERE joinkey = '{}'".format(paper_id))
        res = self.cur.fetchone()
        if res:
            return res[1]
        else:
            return ""

    def get_paper_journal(self, paper_id):
        """
        get paper journal

        Args:
            paper_id: the id of the paper
        Returns:
            str: the journal of the paper
        """
        self.cur.execute("SELECT * FROM pap_journal WHERE joinkey = '{}'".format(paper_id))
        res = self.cur.fetchone()
        if res:
            return res[1]
        else:
            return ""

    def get_pmid(self, paper_id):
        self.cur.execute("SELECT * FROM pap_identifier WHERE joinkey = '{}' AND pap_identifier LIKE 'pmid%'".format(paper_id))
        res = self.cur.fetchone()
        if res and res[1].startswith("pmid"):
            return res[1].replace("pmid", "")
        else:
            return ""
    
    def get_paper_antibody(self, paper_id):
        """
        get paper antibody value
    
        Args:
            paper_id: the id of the paper
        Returns:
            bool: whether the antibody value has been set for this paper
        """
        self.cur.execute("SELECT * FROM cur_strdata WHERE cur_paper = '{}'".format(paper_id))
        res = self.cur.fetchone()
        if res:
            if res[1] == "antibody" and res[3] != "":
                return True
        return False

    def get_transgene_name_id_map(self):
        """
        get a map that returns the id of a transgene given its symbol

        Returns:
            Dict[str, str]: the map between transgene symbol and id
        """
        transgene_name_id_map = {}
        self.cur.execute("SELECT trp_name.trp_name, trp_publicname.trp_publicname "
                         "FROM trp_name, trp_publicname "
                         "WHERE trp_name.joinkey = trp_publicname.joinkey")
        rows = self.cur.fetchall()
        transgene_name_id_map.update({row[1]: row[0] for row in rows})
        self.cur.execute("SELECT trp_name.trp_name, trp_synonym.trp_synonym "
                         "FROM trp_name, trp_synonym "
                         "WHERE trp_name.joinkey = trp_synonym.joinkey;")
        rows = self.cur.fetchall()
        transgene_name_id_map.update({row[1]: row[0] for row in rows})
        return transgene_name_id_map

    def get_passwd(self, paper_id):
        self.cur.execute("SELECT * FROM afp_passwd WHERE joinkey = '{}'".format(paper_id))
        res = self.cur.fetchone()
        if res:
            return res[1]
        else:
            return None

    def get_taxonid_speciesnamearr_map(self):
        self.cur.execute("SELECT * FROM pap_species_index")
        rows = self.cur.fetchall()
        return {row[0]: [row[1]] for row in rows}

    def get_person_id_from_email_address(self, email_address):
        self.cur.execute("SELECT * FROM two_email WHERE two_email='{}'".format(email_address))
        res = self.cur.fetchone()
        if res:
            return res[0]
        else:
            self.cur.execute("SELECT * FROM two_old_email WHERE two_old_email='{}'".format(email_address))
            res = self.cur.fetchone()
            if res:
                return res[0]
        return None

    def get_current_email_address_for_person(self, person_id):
        self.cur.execute("SELECT * FROM two_email WHERE joinkey='{}'".format(person_id))
        res = self.cur.fetchone()
        if res:
            return res[2]
        else:
            return None

    def set_extracted_entities_in_paper(self, publication_id, entities_ids: List[str], table_name):
        self.cur.execute("DELETE FROM {} WHERE joinkey = '{}'".format(table_name, publication_id))
        self.cur.execute("INSERT INTO {} (joinkey, {}) VALUES('{}', '{}')".format(
            table_name, table_name, publication_id, AFP_ENTITIES_SEPARATOR.join(entities_ids)))

    def set_antibody(self, paper_id):
        self.cur.execute("DELETE FROM tfp_antibody WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO tfp_antibody (joinkey, afp_antibody) VALUES('{}', 'checked')".format(paper_id))

    def set_passwd(self, publication_id, passwd):
        self.cur.execute("DELETE FROM afp_passwd WHERE joinkey = '{}'".format(publication_id))
        self.cur.execute("INSERT INTO afp_passwd (joinkey, afp_passwd) VALUES('{}', '{}')".format(publication_id, passwd))
        self.cur.execute("INSERT INTO afp_passwd_hst (joinkey, afp_passwd_hst) VALUES('{}', '{}')".format(publication_id, passwd))

    def set_email(self, publication_id, email_addr_list: List[str]):
        self.cur.execute("DELETE FROM afp_email WHERE joinkey = '{}'".format(publication_id))
        for email_addr in email_addr_list:
            self.cur.execute("INSERT INTO afp_email (joinkey, afp_email) VALUES('{}', '{}')".format(publication_id, email_addr))
            self.cur.execute("INSERT INTO afp_email_hst (joinkey, afp_email_hst) VALUES('{}', '{}')".format(publication_id, email_addr))

    def set_gene_list(self, genes, paper_id):
        self.cur.execute("DELETE FROM afp_genestudied WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_genestudied (joinkey, afp_genestudied) VALUES('{}', '{}')"
                         .format(paper_id, genes))
        self.cur.execute("INSERT INTO afp_genestudied_hst (joinkey, afp_genestudied_hst) VALUES('{}', '{}')"
                         .format(paper_id, genes))

    def set_gene_model_update(self, gene_model_update, paper_id):
        self.cur.execute("DELETE FROM afp_structcorr WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_structcorr (joinkey, afp_structcorr) VALUES('{}', '{}')"
                         .format(paper_id, gene_model_update))
        self.cur.execute("INSERT INTO afp_structcorr_hst (joinkey, afp_structcorr_hst) VALUES('{}', '{}')"
                         .format(paper_id, gene_model_update))

    def set_species_list(self, species, paper_id):
        self.cur.execute("DELETE FROM afp_species WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_species (joinkey, afp_species) VALUES('{}', '{}')"
                         .format(paper_id, species))
        self.cur.execute("INSERT INTO afp_species_hst (joinkey, afp_species_hst) VALUES('{}', '{}')"
                         .format(paper_id, species))

    def set_alleles_list(self, alleles, paper_id):
        self.cur.execute("DELETE FROM afp_variation WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_variation (joinkey, afp_variation) VALUES('{}', '{}')"
                         .format(paper_id, alleles))
        self.cur.execute("INSERT INTO afp_variation_hst (joinkey, afp_variation_hst) VALUES('{}', '{}')"
                         .format(paper_id, alleles))

    def set_allele_seq_change(self, allele_seq_change, paper_id):
        self.cur.execute("DELETE FROM afp_seqchange WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_seqchange (joinkey, afp_seqchange) VALUES('{}', '{}')"
                         .format(paper_id, allele_seq_change))
        self.cur.execute("INSERT INTO afp_seqchange_hst (joinkey, afp_seqchange_hst) VALUES('{}', '{}')"
                         .format(paper_id, allele_seq_change))

    def set_other_alleles(self, other_alleles, paper_id):
        self.cur.execute("DELETE FROM afp_othervariation WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_othervariation (joinkey, afp_othervariation) VALUES('{}', '{}')"
                         .format(paper_id, other_alleles))
        self.cur.execute("INSERT INTO afp_othervariation_hst (joinkey, afp_othervariation_hst) VALUES('{}', '{}')"
                         .format(paper_id, other_alleles))

    def set_strains_list(self, strains, paper_id):
        self.cur.execute("DELETE FROM afp_strain WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_strain (joinkey, afp_strain) VALUES('{}', '{}')"
                         .format(paper_id, strains))
        self.cur.execute("INSERT INTO afp_strain_hst (joinkey, afp_strain_hst) VALUES('{}', '{}')"
                         .format(paper_id, strains))

    def set_other_strains(self, other_strains, paper_id):
        self.cur.execute("DELETE FROM afp_otherstrain WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_otherstrain (joinkey, afp_otherstrain) VALUES('{}', '{}')"
                         .format(paper_id, other_strains))
        self.cur.execute("INSERT INTO afp_otherstrain_hst (joinkey, afp_otherstrain_hst) VALUES('{}', '{}')"
                         .format(paper_id, other_strains))

    def set_transgenes_list(self, transgenes, paper_id):
        self.cur.execute("DELETE FROM afp_transgene WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_transgene (joinkey, afp_transgene) VALUES('{}', '{}')"
                         .format(paper_id, transgenes))
        self.cur.execute("INSERT INTO afp_transgene_hst (joinkey, afp_transgene_hst) VALUES('{}', '{}')"
                         .format(paper_id, transgenes))

    def set_new_transgenes(self, new_transgenes, paper_id):
        self.cur.execute("DELETE FROM afp_othertransgene WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_othertransgene (joinkey, afp_othertransgene) VALUES('{}', '{}')"
                         .format(paper_id, new_transgenes))
        self.cur.execute("INSERT INTO afp_othertransgene_hst (joinkey, afp_othertransgene_hst) VALUES('{}', '{}')"
                         .format(paper_id, new_transgenes))

    def set_new_antibody(self, new_antibody, paper_id):
        self.cur.execute("DELETE FROM afp_antibody WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_antibody (joinkey, afp_antibody) VALUES('{}', '{}')"
                         .format(paper_id, new_antibody))
        self.cur.execute("INSERT INTO afp_antibody_hst (joinkey, afp_antibody_hst) VALUES('{}', '{}')"
                         .format(paper_id, new_antibody))

    def set_other_antibodies(self, other_antibodies, paper_id):
        self.cur.execute("DELETE FROM afp_otherantibody WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_otherantibody (joinkey, afp_otherantibody) VALUES('{}', '{}')"
                         .format(paper_id, other_antibodies))
        self.cur.execute("INSERT INTO afp_otherantibody_hst (joinkey, afp_otherantibody_hst) VALUES('{}', '{}')"
                         .format(paper_id, other_antibodies))

    def set_anatomic_expr(self, anatomic_expr, paper_id):
        self.cur.execute("DELETE FROM afp_otherexpr WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_otherexpr (joinkey, afp_otherexpr) VALUES('{}', '{}')"
                         .format(paper_id, anatomic_expr))
        self.cur.execute("INSERT INTO afp_otherexpr_hst (joinkey, afp_otherexpr_hst) VALUES('{}', '{}')"
                         .format(paper_id, anatomic_expr))

    def set_site_action(self, site_action, paper_id):
        self.cur.execute("DELETE FROM afp_siteaction WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_siteaction (joinkey, afp_siteaction) VALUES('{}', '{}')"
                         .format(paper_id, site_action))
        self.cur.execute("INSERT INTO afp_siteaction_hst (joinkey, afp_siteaction_hst) VALUES('{}', '{}')"
                         .format(paper_id, site_action))

    def set_time_action(self, time_action, paper_id):
        self.cur.execute("DELETE FROM afp_timeaction WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_timeaction (joinkey, afp_timeaction) VALUES('{}', '{}')"
                         .format(paper_id, time_action))
        self.cur.execute("INSERT INTO afp_timeaction_hst (joinkey, afp_timeaction_hst) VALUES('{}', '{}')"
                         .format(paper_id, time_action))

    def set_rnaseq(self, rnaseq, paper_id):
        self.cur.execute("DELETE FROM afp_rnaseq WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_rnaseq (joinkey, afp_rnaseq) VALUES('{}', '{}')"
                         .format(paper_id, rnaseq))
        self.cur.execute("INSERT INTO afp_rnaseq_hst (joinkey, afp_rnaseq_hst) VALUES('{}', '{}')"
                         .format(paper_id, rnaseq))

    def set_additional_expr(self, additional_expr, paper_id):
        self.cur.execute("DELETE FROM afp_additionalexpr WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_additionalexpr (joinkey, afp_additionalexpr) VALUES('{}', '{}')"
                         .format(paper_id, additional_expr))
        self.cur.execute("INSERT INTO afp_additionalexpr_hst (joinkey, afp_additionalexpr_hst) VALUES('{}', '{}')"
                         .format(paper_id, additional_expr))

    def set_gene_int(self, gene_int, paper_id):
        self.cur.execute("DELETE FROM afp_geneint WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_geneint (joinkey, afp_geneint) VALUES('{}', '{}')"
                         .format(paper_id, gene_int))
        self.cur.execute("INSERT INTO afp_geneint_hst (joinkey, afp_geneint_hst) VALUES('{}', '{}')"
                         .format(paper_id, gene_int))

    def set_phys_int(self, phys_int, paper_id):
        self.cur.execute("DELETE FROM afp_geneprod WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_geneprod (joinkey, afp_geneprod) VALUES('{}', '{}')"
                         .format(paper_id, phys_int))
        self.cur.execute("INSERT INTO afp_geneprod_hst (joinkey, afp_geneprod_hst) VALUES('{}', '{}')"
                         .format(paper_id, phys_int))

    def set_gene_reg(self, gene_reg, paper_id):
        self.cur.execute("DELETE FROM afp_genereg WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_genereg (joinkey, afp_genereg) VALUES('{}', '{}')"
                         .format(paper_id, gene_reg))
        self.cur.execute("INSERT INTO afp_genereg_hst (joinkey, afp_genereg_hst) VALUES('{}', '{}')"
                         .format(paper_id, gene_reg))

    def set_allele_pheno(self, allele_pheno, paper_id):
        self.cur.execute("DELETE FROM afp_newmutant WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_newmutant (joinkey, afp_newmutant) VALUES('{}', '{}')"
                         .format(paper_id, allele_pheno))
        self.cur.execute("INSERT INTO afp_newmutant_hst (joinkey, afp_newmutant_hst) VALUES('{}', '{}')"
                         .format(paper_id, allele_pheno))

    def set_rnai_pheno(self, rnai_pheno, paper_id):
        self.cur.execute("DELETE FROM afp_rnai WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_rnai (joinkey, afp_rnai) VALUES('{}', '{}')"
                         .format(paper_id, rnai_pheno))
        self.cur.execute("INSERT INTO afp_rnai_hst (joinkey, afp_rnai_hst) VALUES('{}', '{}')"
                         .format(paper_id, rnai_pheno))

    def set_transover_pheno(self, transover_pheno, paper_id):
        self.cur.execute("DELETE FROM afp_overexpr WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_overexpr (joinkey, afp_overexpr) VALUES('{}', '{}')"
                         .format(paper_id, transover_pheno))
        self.cur.execute("INSERT INTO afp_overexpr_hst (joinkey, afp_overexpr_hst) VALUES('{}', '{}')"
                         .format(paper_id, transover_pheno))

    def set_chemical(self, chemical, paper_id):
        self.cur.execute("DELETE FROM afp_chemphen WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_chemphen (joinkey, afp_chemphen) VALUES('{}', '{}')"
                         .format(paper_id, chemical))
        self.cur.execute("INSERT INTO afp_chemphen_hst (joinkey, afp_chemphen_hst) VALUES('{}', '{}')"
                         .format(paper_id, chemical))

    def set_env(self, env, paper_id):
        self.cur.execute("DELETE FROM afp_envpheno WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_envpheno (joinkey, afp_envpheno) VALUES('{}', '{}')"
                         .format(paper_id, env))
        self.cur.execute("INSERT INTO afp_envpheno_hst (joinkey, afp_envpheno_hst) VALUES('{}', '{}')"
                         .format(paper_id, env))

    def set_protein(self, protein, paper_id):
        self.cur.execute("DELETE FROM afp_catalyticact WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_catalyticact (joinkey, afp_catalyticact) VALUES('{}', '{}')"
                         .format(paper_id, protein))
        self.cur.execute("INSERT INTO afp_catalyticact_hst (joinkey, afp_catalyticact_hst) VALUES('{}', '{}')"
                         .format(paper_id, protein))

    def set_disease(self, disease, paper_id):
        self.cur.execute("DELETE FROM afp_humdis WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_humdis (joinkey, afp_humdis) VALUES('{}', '{}')"
                         .format(paper_id, disease))
        self.cur.execute("INSERT INTO afp_humdis_hst (joinkey, afp_humdis_hst) VALUES('{}', '{}')"
                         .format(paper_id, disease))

    def set_comments(self, comments, paper_id):
        self.cur.execute("DELETE FROM afp_comment WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_comment (joinkey, afp_comment) VALUES('{}', '{}')"
                         .format(paper_id, comments))
        self.cur.execute("INSERT INTO afp_comment_hst (joinkey, afp_comment_hst) VALUES('{}', '{}')"
                         .format(paper_id, comments))

    def set_version(self, paper_id):
        self.cur.execute("DELETE FROM afp_version WHERE joinkey = '{}'".format(paper_id))
        self.cur.execute("INSERT INTO afp_version (joinkey, afp_version) VALUES('{}', '2')".format(paper_id))

    def get_user_fullname_from_personid(self, person_id):
        fullname_arr = []
        self.cur.execute("SELECT * FROM two_firstname WHERE joinkey='{}' ORDER BY two_order".format(person_id))
        res = self.cur.fetchall()
        if res:
            fullname_arr.append(" ".join([col[2] for col in res]))
        self.cur.execute("SELECT * FROM two_middlename WHERE joinkey='{}' ORDER BY two_order".format(person_id))
        res = self.cur.fetchall()
        if res:
            fullname_arr.append(" ".join([col[2] for col in res]))
        self.cur.execute("SELECT * FROM two_lastname WHERE joinkey='{}' ORDER BY two_order".format(person_id))
        res = self.cur.fetchall()
        if res:
            fullname_arr.append(" ".join([col[2] for col in res]))
        if not fullname_arr:
            fullname_arr = ["Unknown user"]
        return " ".join(fullname_arr)

    def set_pap_gene_list(self, paper_id, person_id):
        self.cur.execute("SELECT * FROM pap_gene WHERE pap_evidence = '{}'".format(PAP_AFP_EVIDENCE_CODE))
        res_pap = self.cur.fetchall()
        if res_pap:
            for res in res_pap:
                self.cur.execute("INSERT INTO h_pap_gene (joinkey, pap_gene, pap_order, pap_curator, pap_evidence) "
                                 "VALUES('{}', '{}', {}, '{}', '{}')".format(res[0], res[1], res[2], res[3], res[4]))
        self.cur.execute("DELETE FROM pap_gene WHERE pap_evidence = '{}'".format(PAP_AFP_EVIDENCE_CODE))
        max_order = 0
        self.cur.execute("SELECT MAX(pap_order) FROM pap_gene WHERE joinkey = '{}' AND pap_evidence <> '{}'"
                         .format(paper_id, PAP_AFP_EVIDENCE_CODE))
        res = self.cur.fetchone()
        if res and res[0]:
            max_order = int(res[0])
        self.cur.execute("SELECT * FROM afp_genestudied WHERE joinkey = '{}'".format(paper_id))
        res_afp = self.cur.fetchone()
        afp_ids = set()
        if res_afp:
            afp_ids = set([gene_str.split(AFP_IDS_SEPARATOR)[0] for gene_str in res_afp[1]
                          .split(AFP_ENTITIES_SEPARATOR)])
        for afp_id in afp_ids:
            self.cur.execute("INSERT INTO pap_gene (joinkey, pap_gene, pap_order, pap_curator, pap_evidence) "
                             "VALUES('{}', '{}', {}, '{}', '{}')".format(paper_id, afp_id, max_order + 1,
                                                                         person_id, PAP_AFP_EVIDENCE_CODE))
            self.cur.execute("INSERT INTO h_pap_gene (joinkey, pap_gene, pap_order, pap_curator, pap_evidence) "
                             "VALUES('{}', '{}', {}, '{}', '{}')".format(paper_id, afp_id, max_order + 1,
                                                                         person_id, PAP_AFP_EVIDENCE_CODE))
            max_order += 1

    def set_pap_species_list(self, paper_id, person_id):
        self.cur.execute("SELECT * FROM pap_species WHERE pap_evidence = '{}'".format(PAP_AFP_EVIDENCE_CODE))
        res_pap = self.cur.fetchall()
        if res_pap:
            for res in res_pap:
                self.cur.execute("INSERT INTO h_pap_species (joinkey, pap_species, pap_order, pap_curator, "
                                 "pap_evidence) VALUES('{}', '{}', {}, '{}', '{}')".format(res[0], res[1],
                                                                                           res[2], res[3], res[4]))
        self.cur.execute("DELETE FROM pap_species WHERE pap_evidence = '{}'".format(PAP_AFP_EVIDENCE_CODE))
        max_order = 0
        self.cur.execute("SELECT MAX(pap_order) FROM pap_species WHERE joinkey = '{}' AND pap_evidence <> '{}'"
                         .format(paper_id, PAP_AFP_EVIDENCE_CODE))
        res = self.cur.fetchone()
        if res and res[0]:
            max_order = int(res[0])
        self.cur.execute("SELECT * FROM afp_species WHERE joinkey = '{}'".format(paper_id))
        res_afp = self.cur.fetchone()
        afp_species = set([gene_str for gene_str in res_afp[1].split(AFP_ENTITIES_SEPARATOR)])
        for afp_sp in afp_species:
            self.cur.execute("SELECT * FROM pap_species_index WHERE pap_species_index = '{}'".format(afp_sp))
            res_species_index = self.cur.fetchone()
            if res_species_index:
                self.cur.execute("INSERT INTO pap_species (joinkey, pap_species, pap_order, pap_curator, pap_evidence) "
                                 "VALUES('{}', '{}', {}, '{}', '{}')".format(paper_id, res_species_index[0],
                                                                             max_order + 1, person_id,
                                                                             PAP_AFP_EVIDENCE_CODE))
                self.cur.execute("INSERT INTO h_pap_species (joinkey, pap_species, pap_order, pap_curator, "
                                 "pap_evidence) VALUES('{}', '{}', {}, '{}', '{}')".format(
                                  paper_id, res_species_index[0], max_order + 1, person_id, PAP_AFP_EVIDENCE_CODE))
                max_order += 1

    def get_paper_pdf_paths(self, paper_id):
        self.cur.execute("SELECT pap_electronic_path FROM pap_electronic_path WHERE joinkey = '{}'".format(paper_id))
        rows = self.cur.fetchall()
        main_pdf = None
        pdfs = []
        for row in rows:
            if row[0].endswith(".pdf"):
                if (("_temp" in row[0] or "_ocr" in row[0] or "_lib" in row[0]) and not main_pdf) or \
                        ("_temp" not in row[0] and "_ocr" not in row[0] and "_lib" not in row[0]):
                    main_pdf_addr = quote(row[0])
                    main_pdf = main_pdf_addr.replace('/home/acedb/daniel/Reference/wb/pdf/', TAZENDRA_PDFS_LOCATION)
            elif "supplemental" in row[0]:
                sup_folder = row[0].split("/")[-1]
                with urllib.request.urlopen(TAZENDRA_PDFS_LOCATION + "/" + sup_folder) as response:
                    html_list = response.read().decode("utf8")
                    sup_pdfs = [html.unescape(sup_pdf) for sup_pdf in re.findall(r">([^><]+\.pdf)<", html_list)]
                    pdfs = [TAZENDRA_PDFS_LOCATION + sup_folder + "/" + quote(sup, safe='&/') for sup in sup_pdfs]
        if main_pdf:
            pdfs.append(main_pdf)
            if "_temp" in main_pdf or "_ocr" in main_pdf or "_lib" in main_pdf:
                logger.warning("Temporary or ocr file found as main pdf, discarding")
                return []
        return pdfs

    def set_last_touched(self, paper_id):
        self.cur.execute("DELETE FROM afp_lasttouched WHERE joinkey = '{}'".format(paper_id))
        curtime = int(time.time())
        self.cur.execute("INSERT INTO afp_lasttouched (joinkey, afp_lasttouched) VALUES('{}', '{}')"
                         .format(paper_id, curtime))
        self.cur.execute("INSERT INTO afp_lasttouched_hst (joinkey, afp_lasttouched_hst) VALUES('{}', '{}')"
                         .format(paper_id, curtime))

    def get_positive_paper_ids_sumbitted_last_month_for_data_type(self, data_type_table_name):
        self.cur.execute("SELECT {}.joinkey from {} join afp_comment on {}.joinkey = afp_comment.joinkey "
                         "WHERE {}.afp_cur_timestamp > now() - interval '1 month' AND "
                         "{}.{} IS NOT NULL".format(data_type_table_name, data_type_table_name, data_type_table_name,
                                                    data_type_table_name, data_type_table_name, data_type_table_name))
        rows = self.cur.fetchall()
        return [row[0] for row in rows]

    def get_feature(self, table_name, paper_id):
        self.cur.execute("SELECT {} from {} WHERE joinkey = '{}'".format(table_name, table_name, paper_id))
        row = self.cur.fetchone()
        if row:
            return row[0]
        else:
            return 'null'

    def get_svm_value(self, svm_type, paper_id):
        self.cur.execute("SELECT cur_svmdata from cur_svmdata WHERE cur_paper = '{}' AND cur_datatype = '{}'".format(
            paper_id, svm_type))
        row = self.cur.fetchone()
        if row:
            return row[0] == "high" or row[0] == "medium"
        else:
            return False

    def author_has_submitted(self, paper_id):
        self.cur.execute("SELECT count(*) from afp_lasttouched WHERE joinkey = '{}'".format(paper_id))
        row = self.cur.fetchone()
        return int(row[0]) == 1

    def author_has_modified(self, paper_id):
        self.cur.execute("SELECT afp_g.afp_genestudied <> tfp_g.tfp_genestudied OR "
                         "afp_s.afp_species <> tfp_s.tfp_species OR "
                         "afp_v.afp_variation <> tfp_v.tfp_variation OR "
                         "afp_st.afp_strain <> tfp_st.tfp_strain OR "
                         "afp_t.afp_transgene <> tfp_t.tfp_transgene "
                         "FROM afp_genestudied afp_g JOIN tfp_genestudied tfp_g ON afp_g.joinkey = tfp_g.joinkey "
                         "JOIN afp_species afp_s ON afp_g.joinkey = afp_s.joinkey JOIN tfp_species tfp_s ON afp_g.joinkey = tfp_s.joinkey "
                         "JOIN afp_variation afp_v ON afp_g.joinkey = afp_v.joinkey JOIN tfp_variation tfp_v ON afp_g.joinkey = tfp_v.joinkey "
                         "JOIN afp_strain afp_st ON afp_g.joinkey = afp_st.joinkey JOIN tfp_strain tfp_st ON afp_g.joinkey = tfp_st.joinkey "
                         "JOIN afp_transgene afp_t ON afp_g.joinkey = afp_t.joinkey JOIN tfp_transgene tfp_t ON afp_g.joinkey = tfp_t.joinkey "
                         "WHERE afp_g.joinkey = '{}'".format(paper_id))
        row = self.cur.fetchone()
        if row and row[0]:
            return True
        self.cur.execute("SELECT cur_datatype, cur_svmdata from cur_svmdata WHERE cur_paper = '{}' AND cur_datatype IN "
                         "('seqchange', 'geneint', 'geneprod', 'genereg', 'newmutant', 'rnai', 'overexpr')"
                         .format(paper_id))
        rows = self.cur.fetchall()
        for row in rows:
            self.cur.execute("SELECT afp_{} = '' AND ('{}' = 'medium' OR '{}' = 'high') OR (afp_{} <> '' AND '{}' <> "
                             "'medium' AND '{}' <> 'high') from afp_{} WHERE "
                             "joinkey = '{}'".format(row[0], row[1], row[1], row[0], row[1], row[1], row[0], paper_id))
            row2 = self.cur.fetchone()
            if row2 and row2[0]:
                return True
        self.cur.execute("SELECT afp_structcorr.afp_structcorr <> '' OR afp_antibody.afp_antibody <> '' OR "
                         "afp_siteaction.afp_siteaction <> '' OR afp_timeaction.afp_timeaction <> '' OR "
                         "afp_rnaseq.afp_rnaseq <> '' OR afp_chemphen.afp_chemphen <> '' OR "
                         "afp_envpheno.afp_envpheno <> '' OR afp_catalyticact.afp_catalyticact <> '' OR "
                         "afp_comment.afp_comment <> '' "
                         "FROM afp_structcorr JOIN afp_antibody ON afp_structcorr.joinkey = afp_antibody.joinkey "
                         "JOIN afp_siteaction ON afp_structcorr.joinkey = afp_siteaction.joinkey "
                         "JOIN afp_timeaction ON afp_structcorr.joinkey = afp_timeaction.joinkey "
                         "JOIN afp_rnaseq ON afp_structcorr.joinkey = afp_rnaseq.joinkey "
                         "JOIN afp_chemphen ON afp_structcorr.joinkey = afp_chemphen.joinkey "
                         "JOIN afp_envpheno ON afp_structcorr.joinkey = afp_envpheno.joinkey "
                         "JOIN afp_catalyticact ON afp_structcorr.joinkey = afp_catalyticact.joinkey "
                         "JOIN afp_comment ON afp_structcorr.joinkey = afp_comment.joinkey "
                         "WHERE afp_structcorr.joinkey = '{}'".format(paper_id))
        row = self.cur.fetchone()
        if row and row[0]:
            return True
        afp_newalleles = []
        afp_newstrains = []
        afp_newtransgenes = []
        afp_otherantibodies = []
        new_alleles_raw = self.get_feature("afp_othervariation", paper_id)
        if new_alleles_raw and new_alleles_raw != "null":
            afp_newalleles = [elem['name'] for elem in json.loads(new_alleles_raw) if elem["name"] != ""]
        newstrains_raw = self.get_feature("afp_otherstrain", paper_id)
        if newstrains_raw and new_alleles_raw != "null":
            afp_newstrains = [elem['name'] for elem in json.loads(newstrains_raw) if elem["name"] != ""]
        newtransgenes_raw = self.get_feature("afp_othertransgene", paper_id)
        if newtransgenes_raw and new_alleles_raw != "null":
            afp_newtransgenes = [elem['name'] for elem in json.loads(newtransgenes_raw) if elem["name"] != ""]
        otherantibodies_raw = self.get_feature("afp_othertransgene", paper_id)
        if otherantibodies_raw and otherantibodies_raw != "null":
            afp_otherantibodies = [elem['name'] + ";%;" + elem["publicationId"] for elem in json.loads(
                otherantibodies_raw) if elem["name"] != ""]
        if len(afp_newalleles) > 0 or len(afp_newstrains) > 0 or len(afp_newtransgenes) > 0 or \
                len(afp_otherantibodies) > 0:
            return True
        return False

    def get_corresponding_author_id(self, paper_id):
        self.cur.execute("SELECT afp_email FROM afp_email WHERE joinkey = '{}'".format(paper_id))
        res = self.cur.fetchone()
        if res:
            return self.get_person_id_from_email_address(res[0])
        else:
            return None

    def get_corresponding_author_email(self, paper_id):
        self.cur.execute("SELECT afp_email FROM afp_email WHERE joinkey = '{}'".format(paper_id))
        res = self.cur.fetchone()
        if res:
            return res[0]
        else:
            return None

    def get_afp_form_link(self, paper_id, base_url):
        passwd = self.get_passwd(paper_id)
        title = self.get_paper_title(paper_id)
        journal = self.get_paper_journal(paper_id)
        pmid = self.get_pmid(paper_id)
        person_id = self.get_corresponding_author_id(paper_id)
        if person_id:
            url = base_url + "?paper=" + paper_id + "&passwd=" + passwd + "&title=" + urllib.parse.quote(title) + \
                  "&journal=" + urllib.parse.quote(journal) + "&pmid=" + pmid + "&personid=" + \
                  person_id.replace("two", "") + "&hide_genes=false&hide_alleles=false&hide_strains=false"
        else:
            url = ""
        return url

    def get_num_papers_new_afp_processed(self):
        self.cur.execute("SELECT count(*) FROM afp_email JOIN afp_version ON afp_email.joinkey = afp_version.joinkey "
                         "WHERE afp_version.afp_version = '2'")
        res = self.cur.fetchone()
        if res:
            return int(res[0])
        else:
            return 0

    def get_num_papers_old_afp_processed(self):
        self.cur.execute("SELECT count(*) FROM afp_email FULL OUTER JOIN afp_version ON afp_email.joinkey = "
                         "afp_version.joinkey WHERE afp_version.afp_version IS NULL OR afp_version.afp_version = '1'")
        res = self.cur.fetchone()
        if res:
            return int(res[0])
        else:
            return 0

    def get_num_papers_new_afp_author_submitted(self):
        self.cur.execute("SELECT count(*) FROM afp_lasttouched JOIN afp_version ON "
                         "afp_lasttouched.joinkey = afp_version.joinkey WHERE afp_version.afp_version = '2'")
        res = self.cur.fetchone()
        if res:
            return int(res[0])
        else:
            return 0

    def get_num_papers_old_afp_author_submitted(self):
        self.cur.execute("SELECT count(*) FROM afp_lasttouched FULL OUTER JOIN afp_version ON "
                         "afp_lasttouched.joinkey = afp_version.joinkey WHERE afp_version.afp_version IS NULL OR "
                         "afp_version.afp_version = '1'")
        res = self.cur.fetchone()
        if res:
            return int(res[0])
        else:
            return 0

    def get_num_entities_extracted_by_afp(self, enetity_label):
        self.cur.execute("SELECT tfp_{} FROM tfp_{} FULL OUTER JOIN afp_version ON "
                         "tfp_{}.joinkey = afp_version.joinkey WHERE afp_version.afp_version = '2'"
                         .format(enetity_label, enetity_label, enetity_label))
        res = self.cur.fetchall()
        return [len(row[0].split(" | ")) for row in res]

    def get_doi_from_paper_id(self, paper_id):
        self.cur.execute("SELECT pap_identifier FROM pap_identifier WHERE joinkey = '{}' AND pap_identifier "
                         "LIKE 'doi%'".format(paper_id))
        res = self.cur.fetchone()
        if res and res[0].startswith("doi"):
            return res[0][3:]
        else:
            return ""

    def get_list_paper_ids_afp_processed(self, from_offset, count):
        self.cur.execute("SELECT joinkey FROM afp_version WHERE afp_version.afp_version = '2' ORDER BY joinkey DESC "
                         "OFFSET {} LIMIT {}".format(from_offset, count))
        res = self.cur.fetchall()
        return [row[0] for row in res]

    def get_list_paper_ids_afp_submitted(self, from_offset, count):
        self.cur.execute("SELECT afp_lasttouched.joinkey FROM afp_lasttouched JOIN afp_version ON "
                         "afp_lasttouched.joinkey = afp_version.joinkey WHERE afp_version.afp_version = '2' "
                         "ORDER BY joinkey DESC OFFSET {} LIMIT {}".format(from_offset, count))
        res = self.cur.fetchall()
        return [row[0] for row in res]

    def get_num_papers_new_afp_partial_submissions(self):
        self.cur.execute("SELECT count(*) FROM afp_version afp_ve "
                         "FULL OUTER JOIN afp_lasttouched afp_l ON afp_ve.joinkey = afp_l.joinkey "
                         "FULL OUTER JOIN afp_genestudied afp_g ON afp_ve.joinkey = afp_g.joinkey "
                         "FULL OUTER JOIN afp_species afp_s ON afp_ve.joinkey = afp_s.joinkey "
                         "FULL OUTER JOIN afp_variation afp_v ON afp_ve.joinkey = afp_v.joinkey "
                         "FULL OUTER JOIN afp_strain afp_st ON afp_ve.joinkey = afp_st.joinkey "
                         "FULL OUTER JOIN afp_transgene afp_t ON afp_ve.joinkey = afp_t.joinkey "
                         "FULL OUTER JOIN afp_seqchange afp_seq ON afp_ve.joinkey = afp_seq.joinkey "
                         "FULL OUTER JOIN afp_geneint afp_ge ON afp_ve.joinkey = afp_ge.joinkey "
                         "FULL OUTER JOIN afp_geneprod afp_gp ON afp_ve.joinkey = afp_gp.joinkey "
                         "FULL OUTER JOIN afp_genereg afp_gr ON afp_ve.joinkey = afp_gr.joinkey "
                         "FULL OUTER JOIN afp_newmutant afp_nm ON afp_ve.joinkey = afp_nm.joinkey "
                         "FULL OUTER JOIN afp_rnai afp_rnai ON afp_ve.joinkey = afp_rnai.joinkey "
                         "FULL OUTER JOIN afp_overexpr afp_ov ON afp_ve.joinkey = afp_ov.joinkey "
                         "FULL OUTER JOIN afp_structcorr afp_stc ON afp_ve.joinkey = afp_stc.joinkey "
                         "FULL OUTER JOIN afp_antibody ON afp_ve.joinkey = afp_antibody.joinkey "
                         "FULL OUTER JOIN afp_siteaction ON afp_ve.joinkey = afp_siteaction.joinkey "
                         "FULL OUTER JOIN afp_timeaction ON afp_ve.joinkey = afp_timeaction.joinkey "
                         "FULL OUTER JOIN afp_rnaseq ON afp_ve.joinkey = afp_rnaseq.joinkey "
                         "FULL OUTER JOIN afp_chemphen ON afp_ve.joinkey = afp_chemphen.joinkey "
                         "FULL OUTER JOIN afp_envpheno ON afp_ve.joinkey = afp_envpheno.joinkey "
                         "FULL OUTER JOIN afp_catalyticact ON afp_ve.joinkey = afp_catalyticact.joinkey "
                         "FULL OUTER JOIN afp_comment ON afp_ve.joinkey = afp_comment.joinkey "
                         "WHERE afp_ve.afp_version = '2' AND afp_l.afp_lasttouched is NULL "
                         "AND (afp_g.afp_genestudied IS NOT NULL OR afp_s.afp_species IS NOT NULL OR "
                         "afp_v.afp_variation IS NOT NULL OR afp_st.afp_strain IS NOT NULL OR "
                         "afp_t.afp_transgene IS NOT NULL OR afp_seq.afp_seqchange IS NOT NULL OR "
                         "afp_ge.afp_geneint IS NOT NULL OR afp_gp.afp_geneprod IS NOT NULL OR "
                         "afp_gr.afp_genereg IS NOT NULL OR afp_nm.afp_newmutant IS NOT NULL OR "
                         "afp_rnai.afp_rnai IS NOT NULL OR afp_ov.afp_overexpr IS NOT NULL OR "
                         "afp_stc.afp_structcorr IS NOT NULL OR afp_antibody.afp_antibody IS NOT NULL OR "
                         "afp_siteaction.afp_siteaction IS NOT NULL OR afp_timeaction.afp_timeaction IS NOT NULL OR "
                         "afp_rnaseq.afp_rnaseq IS NOT NULL OR afp_chemphen.afp_chemphen IS NOT NULL OR "
                         "afp_envpheno.afp_envpheno IS NOT NULL OR afp_catalyticact.afp_catalyticact IS NOT NULL OR "
                         "afp_comment.afp_comment IS NOT NULL) ")
        res = self.cur.fetchone()
        if res:
            return int(res[0])
        else:
            return 0

    def get_list_papers_new_afp_partial_submissions(self, from_offset, count):
        self.cur.execute("SELECT afp_ve.joinkey FROM afp_version afp_ve "
                         "FULL OUTER JOIN afp_lasttouched afp_l ON afp_ve.joinkey = afp_l.joinkey "
                         "FULL OUTER JOIN afp_genestudied afp_g ON afp_ve.joinkey = afp_g.joinkey "
                         "FULL OUTER JOIN afp_species afp_s ON afp_ve.joinkey = afp_s.joinkey "
                         "FULL OUTER JOIN afp_variation afp_v ON afp_ve.joinkey = afp_v.joinkey "
                         "FULL OUTER JOIN afp_strain afp_st ON afp_ve.joinkey = afp_st.joinkey "
                         "FULL OUTER JOIN afp_transgene afp_t ON afp_ve.joinkey = afp_t.joinkey "
                         "FULL OUTER JOIN afp_seqchange afp_seq ON afp_ve.joinkey = afp_seq.joinkey "
                         "FULL OUTER JOIN afp_geneint afp_ge ON afp_ve.joinkey = afp_ge.joinkey "
                         "FULL OUTER JOIN afp_geneprod afp_gp ON afp_ve.joinkey = afp_gp.joinkey "
                         "FULL OUTER JOIN afp_genereg afp_gr ON afp_ve.joinkey = afp_gr.joinkey "
                         "FULL OUTER JOIN afp_newmutant afp_nm ON afp_ve.joinkey = afp_nm.joinkey "
                         "FULL OUTER JOIN afp_rnai afp_rnai ON afp_ve.joinkey = afp_rnai.joinkey "
                         "FULL OUTER JOIN afp_overexpr afp_ov ON afp_ve.joinkey = afp_ov.joinkey "
                         "FULL OUTER JOIN afp_structcorr afp_stc ON afp_ve.joinkey = afp_stc.joinkey "
                         "FULL OUTER JOIN afp_antibody ON afp_ve.joinkey = afp_antibody.joinkey "
                         "FULL OUTER JOIN afp_siteaction ON afp_ve.joinkey = afp_siteaction.joinkey "
                         "FULL OUTER JOIN afp_timeaction ON afp_ve.joinkey = afp_timeaction.joinkey "
                         "FULL OUTER JOIN afp_rnaseq ON afp_ve.joinkey = afp_rnaseq.joinkey "
                         "FULL OUTER JOIN afp_chemphen ON afp_ve.joinkey = afp_chemphen.joinkey "
                         "FULL OUTER JOIN afp_envpheno ON afp_ve.joinkey = afp_envpheno.joinkey "
                         "FULL OUTER JOIN afp_catalyticact ON afp_ve.joinkey = afp_catalyticact.joinkey "
                         "FULL OUTER JOIN afp_comment ON afp_ve.joinkey = afp_comment.joinkey "
                         "WHERE afp_ve.afp_version = '2' AND afp_l.afp_lasttouched is NULL "
                         "AND (afp_g.afp_genestudied IS NOT NULL OR afp_s.afp_species IS NOT NULL OR "
                         "afp_v.afp_variation IS NOT NULL OR afp_st.afp_strain IS NOT NULL OR "
                         "afp_t.afp_transgene IS NOT NULL OR afp_seq.afp_seqchange IS NOT NULL OR "
                         "afp_ge.afp_geneint IS NOT NULL OR afp_gp.afp_geneprod IS NOT NULL OR "
                         "afp_gr.afp_genereg IS NOT NULL OR afp_nm.afp_newmutant IS NOT NULL OR "
                         "afp_rnai.afp_rnai IS NOT NULL OR afp_ov.afp_overexpr IS NOT NULL OR "
                         "afp_stc.afp_structcorr IS NOT NULL OR afp_antibody.afp_antibody IS NOT NULL OR "
                         "afp_siteaction.afp_siteaction IS NOT NULL OR afp_timeaction.afp_timeaction IS NOT NULL OR "
                         "afp_rnaseq.afp_rnaseq IS NOT NULL OR afp_chemphen.afp_chemphen IS NOT NULL OR "
                         "afp_envpheno.afp_envpheno IS NOT NULL OR afp_catalyticact.afp_catalyticact IS NOT NULL OR "
                         "afp_comment.afp_comment IS NOT NULL) "
                         "ORDER BY afp_ve.joinkey DESC OFFSET {} LIMIT {}".format(from_offset, count))
        res = self.cur.fetchall()
        return [row[0] for row in res]




