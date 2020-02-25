import copy
import logging
import math
import re
import shutil
from typing import Dict, Set, List

import PyPDF2 as PyPDF2
from PyPDF2.generic import TextStringObject
from PyPDF2.pdf import ContentStream, b_, FloatObject, NumberObject
from PyPDF2.utils import u_
import urllib.request
import tempfile

from src.backend.common.apimanager import APIManager
from src.backend.common.dbmanager import DBManager

SPECIES_ALIASES = {"9913": ["cow", "bovine", "calf"],
                   "7955": ["zebrafish"],
                   "7227": ["fruitfly", "fruitflies"],
                   "9606": ["human"],
                   "10090": ["mouse", "mice", "murine"],
                   "10116": ["rat"],
                   "559292": ["budding yeast"],
                   "4896": ["fission yeast"]}

SPECIES_BLACKLIST = {"4853", "30023", "8805", "216498", "1420681", "10231", "156766", "80388", "101142", "31138",
                     "88086", "34245"}

OPENING_REGEX_STR = "[\\.\\n\\t\\'\\/\\(\\)\\[\\]\\{\\}:;\\,\\!\\?> ]"
CLOSING_REGEX_STR = "[\\.\\n\\t\\'\\/\\(\\)\\[\\]\\{\\}:;\\,\\!\\?> ]"

GENES_BLACKLIST = ['act-1', 'cdc-42', 'dpy-7', 'eri-1', 'fem-1', 'ges-1', 'glp-4', 'him-5', 'hsp-16.2', 'lin-15B',
                   'lin-35', 'lon-2', 'myo-2', 'myo-3', 'pha-1', 'pes-10', 'pie-1', 'rol-6', 'rrf-3', 'spe-11', 'sur-5',
                   'tbb-2', 'unc-22', 'unc-54', 'unc-119', 'cbr-unc-119']

TF_MAP = {}
IDF_MAP = {}


logger = logging.getLogger(__name__)


def get_matches_in_fulltext(fulltext_str, keywords, papers_map, paper_id, min_num_occurrences: int = 1,
                            match_uppercase: bool = False, tot_num_papers: int = 0, tfidf: float = 0.0,
                            api_manager: APIManager = None):
    if min_num_occurrences < 1:
        min_num_occurrences = 1
    for keyword in keywords:
        if keyword in fulltext_str or match_uppercase and keyword.upper() in fulltext_str:
            try:
                match_counter = len(re.findall(OPENING_REGEX_STR + re.escape(keyword) + CLOSING_REGEX_STR,
                                               fulltext_str))
                if match_uppercase and keyword.upper() != keyword:
                    match_counter += len(re.findall(OPENING_REGEX_STR + re.escape(keyword.upper()) +
                                                    CLOSING_REGEX_STR, fulltext_str))
                if match_counter >= min_num_occurrences and (not tfidf or get_tfidf(keyword, match_counter, api_manager,
                                                                                    tot_num_papers) >= tfidf):
                    papers_map[paper_id].add(keyword)
            except:
                pass


def get_tfidf(term, tf, api_manager: APIManager, tot_num_papers):
    idf = math.log(float(tot_num_papers) / api_manager.get_doc_count(term))
    return tf * idf


def get_species_in_fulltext_from_regex(fulltext: str, papers_map: Dict[str, Set[str]], paper_id: str,
                                       taxon_name_map: Dict[str, List[str]], min_occurrences: int = 0,
                                       tot_num_papers: int = 0, tfidf: float = 0.0, api_manager: APIManager = None):
    tx_name_map = copy.deepcopy(taxon_name_map)
    for taxon_id, species_alias_arr in SPECIES_ALIASES.items():
        tx_name_map[taxon_id].extend(species_alias_arr)
    for species_id, regex_list in tx_name_map.items():
        if species_id not in SPECIES_BLACKLIST:
            num_occurrences = 0
            regex_list_mod = regex_list
            if len(regex_list[0].split(" ")) > 1:
                regex_list_mod = [regex_list[0], regex_list[0][0] + "\\. " + " ".join(regex_list[0].split(" ")[1:])]
            if len(regex_list) > 1:
                regex_list_mod.extend(regex_list[1:])
            for regex_text in regex_list_mod:
                num_occurrences += len(re.findall(re.compile(OPENING_REGEX_STR + regex_text.lower() +
                                                             CLOSING_REGEX_STR),
                                                  fulltext.lower()))
            if num_occurrences >= min_occurrences and (not tfidf or get_tfidf(tx_name_map[species_id][1],
                                                                              num_occurrences, api_manager,
                                                                              tot_num_papers) >= tfidf):
                papers_map[paper_id].add(regex_list_mod[0].replace("\\", ""))
    papers_map[paper_id].add(tx_name_map['6239'][0].replace("\\", ""))


def get_first_valid_email_address_from_paper(fulltext, db_manager: DBManager, paper_id):
    all_addresses = re.findall(r'[\(\[]?[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+[\)\]\.]?', fulltext)
    if not all_addresses:
        fulltext = fulltext.replace(". ", ".")
        all_addresses = re.findall(r'[\(\[]?[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+[\)\]\.]?', fulltext)
    if not all_addresses:
        all_addresses = db_manager.get_corresponding_email(paper_id=paper_id)
    for address in all_addresses:
        if "'" not in address:
            person_id = db_manager.get_person_id_from_email_address(address)
            if person_id:
                curr_address = db_manager.get_current_email_address_for_person(person_id)
                return person_id, curr_address if curr_address else address
    return None


def get_fulltext_from_pdfs(pdfs_urls):

    def customExtractText(self):
        text = u_("")
        content = self["/Contents"].getObject()
        if not isinstance(content, ContentStream):
            content = ContentStream(content, self.pdf)
        # Note: we check all strings are TextStringObjects.  ByteStringObjects
        # are strings where the byte->string encoding was unknown, so adding
        # them to the text here would be gibberish.
        for operands, operator in content.operations:
            if operator == b_("Tj"):
                _text = operands[0]
                if isinstance(_text, TextStringObject):
                    text += _text
            elif operator == b_("T*"):
                text += "\n"
            elif operator == b_("'"):
                text += "\n"
                _text = operands[0]
                if isinstance(_text, TextStringObject):
                    text += operands[0]
            elif operator == b_('"'):
                _text = operands[2]
                if isinstance(_text, TextStringObject):
                    text += "\n"
                    text += _text
            elif operator == b_("TJ"):
                for i in operands[0]:
                    if isinstance(i, TextStringObject):
                        text += i
                    elif isinstance(i, FloatObject) or isinstance(i, NumberObject):
                        if i < -100:
                            text += " "
            elif operator == b_("TD") or operator == b_("Tm"):
                if len(text) > 0 and text[-1] != " " and text[-1] != "\n":
                    text += " "
        text = text.replace(" - ", "-")
        text = re.sub("\\s+", " ", text)
        return text

    def convert_pdf2text(pdf_url):
        pdf_fulltext = ""
        with urllib.request.urlopen(pdf_url) as response:
            with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
                shutil.copyfileobj(response, tmp_file)
        try:
            pdf_reader = PyPDF2.PdfFileReader(open(tmp_file.name, 'rb'))
            for i in range(pdf_reader.numPages):
                page_obj = pdf_reader.getPage(i)
                page_obj.extractText = customExtractText
                pdf_fulltext += page_obj.extractText(page_obj)
        except:
            pass
        sentences = pdf_fulltext.split("\n")
        if not any(["reviewer" in sentence and "comment" in sentence for sentence in sentences]):
            return pdf_fulltext
        else:
            logger.info("Skipping response to reviewers")
            return ""

    if pdfs_urls:
        complete_fulltext = ""
        for pdfurl in pdfs_urls[0:-1]:
            complete_fulltext += convert_pdf2text(pdfurl)
        main_text = convert_pdf2text(pdfs_urls[-1])
        if main_text:
            complete_fulltext += main_text
            complete_fulltext = complete_fulltext.replace("\n", " ")
            return complete_fulltext
        else:
            logger.info("Paper with main pdf that cannot be converted: " + pdfs_urls[-1])
    return ""
