from collections import defaultdict


def get_list_of_curatable_papers(cur):
    """
    get the list of curatable papers (i.e., papers that can be processed by AFP)

    :param cur: a DB cursor
    :return (List[str]): the list of curatable papers
    """
    cur.execute("SELECT * FROM pap_primary_data WHERE pap_primary_data = 'primary'")
    rows = cur.fetchall()
    curatable_papers = [row[0] for row in rows]
    cur.execute("SELECT * FROM pap_type WHERE pap_type = '1'")
    rows = cur.fetchall()
    curatable_papers.extend([row[0] for row in rows])
    return curatable_papers


def get_list_of_emailed_papers(cur):
    """
    get the list of papers that have already been processed by AFP (i.e., an email was sent to the authors)

    :param cur: a db cursor
    :return (List[str]): the list of papers that have already been processed
    """
    cur.execute("SELECT * FROM afp_email")
    rows = cur.fetchall()
    emailed_papers = [row[0] for row in rows]
    return emailed_papers


def get_svm_flagged_papers(cur):
    """
    get the list of SVM flagged papers with their values

    :param cur: a db cursor
    :return (Dict[Dict[Bool]): a dictionary with papers ids as keys and, as values, dictionaries with data type as key
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
        papers_svm_flags[row[0]][row[1]] = row[2] != "NEG"
    return papers_svm_flags


def get_all_strains(cur):
    """
    get the list of all strains from the DB

    :param cur: a DB cursor
    :return (ist[str]): the list of strains
    """
    cur.execute("SELECT * FROM obo_name_strain")
    rows = cur.fetchall()
    return [row[1] for row in rows]


def get_all_transgenes(cur):
    """
    get the list of all transgenes and their synonyms from the DB

    :param cur: a DB cursor
    :return (ist[str]): the list of transgenes and synonyms
    """
    cur.execute("SELECT * FROM trp_publicname")
    rows = cur.fetchall()
    transgenes = [row[1] for row in rows]
    cur.execute("SELECT * FROM trp_synonym")
    rows = cur.fetchall()
    transgenes.extend([synonym for row in rows for synonym in row[1].split(" | ") if synonym and synonym[0] != "[" and
                       synonym[-1] != "]"])
    return transgenes


def _describe_table(cur, table_name):
    cur.execute("select column_name, data_type, character_maximum_length from INFORMATION_SCHEMA.COLUMNS where "
                "table_name = '" + table_name + "'")
    rows = cur.fetchall()
    for row in rows:
        print(row)
