from collections import defaultdict
from typing import List


def get_set_of_curatable_papers(cur):
    """
    get the set of curatable papers (i.e., papers that can be processed by AFP)

    Args:
        cur: a DB cursor
    Returns:
        Set[str]: the set of curatable papers
    """
    cur.execute("SELECT * FROM pap_primary_data WHERE pap_primary_data = 'primary'")
    rows = cur.fetchall()
    curatable_papers = [row[0] for row in rows]
    cur.execute("SELECT * FROM pap_type WHERE pap_type = '1'")
    rows = cur.fetchall()
    curatable_papers.extend([row[0] for row in rows])
    return set(curatable_papers)


def get_set_of_afp_processed_papers(cur):
    """
    get the set of papers that have already been processed by AFP

    Args:
        cur: a db cursor
    Returns:
        Set[str]: the set of papers that have already been processed
    """
    cur.execute("SELECT * FROM afp_passwd")
    rows = cur.fetchall()
    processed_papers = [row[0] for row in rows]
    return set(processed_papers)


def get_svm_flagged_papers(cur):
    """
    get the list of SVM flagged papers with their values

    Args:
         cur: a db cursor
    Returns:
        Dict[Dict[Bool]: a dictionary with papers ids as keys and, as values, dictionaries with data type as key
        and a bool values indicating if the paper is SVM positive or negative for each specific data type
    """
    cur.execute("SELECT A.cur_paper, A.cur_datatype, A.cur_svmdata \n"
                "FROM cur_svmdata A \n"
                "INNER JOIN (\n"
                "    SELECT cur_paper, cur_datatype, MAX(CAST(cur_date as date)) AS max_date \n"
                "    FROM cur_svmdata \n"
                "    GROUP BY cur_paper, cur_datatype) B \n"
                "ON A.cur_paper = B.cur_paper AND A.cur_datatype = B.cur_datatype")
    rows = cur.fetchall()
    papers_svm_flags = defaultdict(lambda: defaultdict(bool))
    for row in rows:
        papers_svm_flags[row[0]][row[1]] = row[2] != "NEG" and row[2] != "low"
    return papers_svm_flags


def get_all_genes(cur):
    genes_names = set()
    cur.execute("SELECT * FROM gin_locus WHERE joinkey != ''")
    rows = cur.fetchall()
    for row in rows:
        genes_names.add(row[1])
    cur.execute("SELECT * FROM gin_wbgene WHERE joinkey != ''")
    rows = cur.fetchall()
    for row in rows:
        genes_names.add(row[1])
    cur.execute("SELECT * FROM gin_seqname WHERE joinkey != ''")
    rows = cur.fetchall()
    for row in rows:
        genes_names.add(row[1])
    return list(genes_names)


def get_all_alleles(cur):
    cur.execute("SELECT * FROM obo_name_variation WHERE joinkey != ''")
    rows = cur.fetchall()
    return [row[1] for row in rows]


def get_all_strains(cur):
    """
    get the list of all strains from the DB

    Args:
        cur: a DB cursor
    Returns:
        List[str]: the list of strains
    """
    cur.execute("SELECT * FROM obo_name_strain")
    rows = cur.fetchall()
    return [row[1] for row in rows]


def get_all_transgenes(cur):
    """
    get the list of all transgenes and their synonyms from the DB

    Args:
        cur: a DB cursor
    Returns:
        List[str]: the list of transgenes and synonyms
    """
    cur.execute("SELECT * FROM trp_publicname")
    rows = cur.fetchall()
    transgenes = [row[1] for row in rows]
    cur.execute("SELECT * FROM trp_synonym")
    rows = cur.fetchall()
    transgenes.extend([synonym for row in rows for synonym in row[1].split(" | ") if synonym and synonym[0] != "[" and
                       synonym[-1] != "]"])
    return transgenes


def get_gene_name_id_map(cur):
    """
    get a map that returns the id of a gene given its symbol

    Args:
        cur: a DB cursor
    Returns:
        Dict[str, str]: the map between gene symbol and id
    """
    gene_name_id_map = {}
    cur.execute("SELECT * FROM gin_locus WHERE joinkey != ''")
    rows = cur.fetchall()
    gene_name_id_map.update({row[1]: row[0] for row in rows})
    cur.execute("SELECT * FROM gin_synonyms WHERE joinkey != ''")
    rows = cur.fetchall()
    gene_name_id_map.update({row[1]: row[0] for row in rows})
    cur.execute("SELECT * FROM gin_wbgene WHERE joinkey != ''")
    rows = cur.fetchall()
    gene_name_id_map.update({row[1]: row[0] for row in rows})
    cur.execute("SELECT * FROM gin_seqname WHERE joinkey != ''")
    rows = cur.fetchall()
    gene_name_id_map.update({row[1]: row[0] for row in rows})
    return gene_name_id_map


def get_allele_name_id_map(cur):
    """
    get a map that returns the id of an allele given its symbol

    Args:
        cur: a DB cursor
    Returns:
        Dict[str, str]: the map between allele symbol and id
    """
    cur.execute("SELECT * FROM obo_name_variation WHERE joinkey != ''")
    rows = cur.fetchall()
    return {row[1]: row[0] for row in rows}


def get_paper_title(cur, paper_id):
    """
    get paper title

    Args:
        cur: a DB cursor
        paper_id: the id of the paper
    Returns:
        str: the title of the paper
    """
    cur.execute("SELECT * FROM pap_title WHERE joinkey = '{}'".format(paper_id))
    res = cur.fetchone()
    if res:
        return res[1]
    else:
        return ""


def get_paper_journal(cur, paper_id):
    """
    get paper journal

    Args:
        cur: a DB cursor
        paper_id: the id of the paper
    Returns:
        str: the journal of the paper
    """
    cur.execute("SELECT * FROM pap_journal WHERE joinkey = '{}'".format(paper_id))
    res = cur.fetchone()
    if res:
        return res[1]
    else:
        return ""


def get_paper_antibody(cur, paper_id):
    """
    get paper antibody value

    Args:
        cur: a DB cursor
        paper_id: the id of the paper
    Returns:
        bool: whether the antibody value has been set for this paper
    """
    cur.execute("SELECT * FROM cur_strdata WHERE cur_paper = '{}'".format(paper_id))
    res = cur.fetchone()
    if res:
        if res[1] == "antibody" and res[3] != "":
            return True
    return False


def get_transgene_name_id_map(cur):
    """
    get a map that returns the id of a transgene given its symbol

    Args:
        cur: a DB cursor
    Returns:
        Dict[str, str]: the map between transgene symbol and id
    """
    transgene_name_id_map = {}
    cur.execute("SELECT trp_name.trp_name, trp_publicname.trp_publicname "
                "FROM trp_name, trp_publicname "
                "WHERE trp_name.joinkey = trp_publicname.joinkey")
    rows = cur.fetchall()
    transgene_name_id_map.update({row[1]: row[0] for row in rows})
    cur.execute("SELECT trp_name.trp_name, trp_synonym.trp_synonym "
                "FROM trp_name, trp_synonym "
                "WHERE trp_name.joinkey = trp_synonym.joinkey;")
    rows = cur.fetchall()
    transgene_name_id_map.update({row[1]: row[0] for row in rows})
    return transgene_name_id_map


def get_taxonid_speciesnamearr_map(cur):
    cur.execute("SELECT * FROM pap_species_index")
    rows = cur.fetchall()
    return {row[0]: [row[1]] for row in rows}


def write_extracted_entities_in_paper(cur, publication_id, entities_ids: List[str], table_name):
    cur.execute("INSERT INTO {} (joinkey, {}) VALUES('{}', '{}')".format(
        table_name, table_name, publication_id, " | ".join(entities_ids)))


def write_antibody(cur, paper_id):
    cur.execute("INSERT INTO afp_antibody (joinkey, afp_antibody) VALUES('{}', 'Positive')".format(paper_id))


def write_passwd(cur, publication_id, passwd):
    cur.execute("INSERT INTO afp_passwd (joinkey, afp_passwd) VALUES('{}', '{}')".format(publication_id, passwd))


def write_email(cur, publication_id, email_addr_list: List[str]):
    for email_addr in email_addr_list:
        cur.execute("INSERT INTO afp_email (joinkey, afp_email) VALUES('{}', '{}')".format(publication_id, email_addr))
