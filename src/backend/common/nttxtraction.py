import logging
import math
import re
import shutil
from collections import defaultdict
from typing import List, Dict

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


class NttExtractor(object):

    def __init__(self, tpc_token, dbmanager: DBManager):
        self.api_manager = APIManager(tpc_token)
        self.dbmanager = dbmanager
        self.tot_num_documents = len(dbmanager.get_set_of_curatable_papers())
        self.taxonid_name_map = dbmanager.get_taxonid_speciesnamearr_map()
        for taxon_id, species_alias_arr in SPECIES_ALIASES.items():
            self.taxonid_name_map[taxon_id].extend(species_alias_arr)
        self.taxonid_name_map = {species_id: regex_list for species_id, regex_list in self.taxonid_name_map.items() if
                                 species_id not in SPECIES_BLACKLIST}
        for species_id, regex_list in self.taxonid_name_map.items():
            if len(regex_list[0].split(" ")) > 1:
                self.taxonid_name_map[species_id].append(regex_list[0][0] + "\\. " + " ".join(regex_list[0]
                                                                                              .split(" ")[1:]))

    @staticmethod
    def count_matches(keyword, text, case_sensitive: bool = True, match_uppercase: bool = False) -> int:
        keyword = keyword if case_sensitive else keyword.upper()
        text = text if case_sensitive else text.upper()
        match_uppercase = False if keyword.upper() == keyword else match_uppercase
        if keyword in text or match_uppercase and keyword.upper() in text:
            try:
                match_count = len(re.findall(OPENING_REGEX_STR + re.escape(keyword) + CLOSING_REGEX_STR, text))
                if match_uppercase:
                    match_count += len(re.findall(OPENING_REGEX_STR + re.escape(keyword.upper()) +
                                                  CLOSING_REGEX_STR, text))
                return match_count
            except:
                pass
        return 0

    def is_entity_meaningful(self, entity_keywords: List[str], text, match_uppercase: bool = False,
                             min_num_occurrences: int = 1, tfidf_threshold: float = 0.0) -> bool:
        min_num_occurrences = 1 if min_num_occurrences < 1 else min_num_occurrences
        raw_count = sum(self.count_matches(keyword=keyword, text=text, match_uppercase=match_uppercase) for keyword in
                        entity_keywords)
        return True if raw_count >= min_num_occurrences and (tfidf_threshold <= 0 or 0 < tfidf_threshold <
                                                             self.tfidf(entity_keywords, raw_count)) else False

    def tfidf(self, entity_keywords: List[str], raw_count) -> float:
        doc_counter = sum(self.api_manager.get_doc_count(keyword) for keyword in entity_keywords)
        idf = math.log(float(self.tot_num_documents) / doc_counter if doc_counter > 0 else 0.5)
        return raw_count * idf

    def extract_keywords(self, keywords: List[str], text: str, match_uppercase: bool = False, min_matches: int = 1,
                         tfidf_threshold: float = 0.0, blacklist: List[str] = None) -> List[str]:
        blacklist = set(blacklist) if blacklist else set()
        return [keyword for keyword in set(keywords) if keyword not in blacklist and self.is_entity_meaningful(
            entity_keywords=[keyword], text=text, match_uppercase=match_uppercase, min_num_occurrences=min_matches,
            tfidf_threshold=tfidf_threshold)]

    def extract_species(self, text: str, min_matches: int = 1, tfidf_threshold: float = 0.0):
        return [regex_list[0].replace("\\", "") for regex_list in self.taxonid_name_map.values() if
                self.is_entity_meaningful(entity_keywords=regex_list, text=text, match_uppercase=False,
                                          min_num_occurrences=min_matches, tfidf_threshold=tfidf_threshold)]

    @staticmethod
    def get_entity_ids_from_names(entity_names: List[str], entity_name_id_map: Dict[str, str],
                                  canonical_names_for_non_unique: Dict[str, str] = None):
        entity_ids_counters = defaultdict(int)
        if canonical_names_for_non_unique:
            for entity_name in entity_names:
                entity_ids_counters[entity_name_id_map[entity_name]] += 1
        return list(set([entity_name_id_map[entity_name] + ";%;" + entity_name if
                         entity_ids_counters[entity_name_id_map[entity_name]] < 2 else
                         entity_name_id_map[entity_name] + ";%;" + canonical_names_for_non_unique[entity_name_id_map[
                             entity_name]] for entity_name in entity_names if entity_name in entity_name_id_map]))

    def get_first_valid_email_address_from_paper(self, fulltext, paper_id):
        all_addresses = re.findall(r'[\(\[]?[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+[\)\]\.]?', fulltext)
        if not all_addresses:
            fulltext = fulltext.replace(". ", ".")
            all_addresses = re.findall(r'[\(\[]?[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+[\)\]\.]?', fulltext)
        if not all_addresses:
            all_addresses = self.dbmanager.get_corresponding_email(paper_id=paper_id)
        for address in all_addresses:
            if "'" not in address:
                person_id = self.dbmanager.get_person_id_from_email_address(address)
                if person_id:
                    curr_address = self.dbmanager.get_current_email_address_for_person(person_id)
                    return person_id, curr_address if curr_address else person_id, address
        return None

    def get_first_valid_paper_ids_fulltexts_and_emails(self, paper_ids: List[str], max_papers: int = 50):
        converted_papers = []
        while len(converted_papers) < max_papers and len(paper_ids) > 0:
            id_to_process = paper_ids.pop(0)
            logger.info("Extracting fulltext for paper " + id_to_process)
            paper_fulltext = self.get_fulltext_from_pdfs(paper_id=id_to_process)
            if paper_fulltext != "":
                logger.info("Extracting email address from paper")
                email_address = self.get_first_valid_email_address_from_paper(
                    fulltext=paper_fulltext, paper_id=id_to_process)
                if email_address:
                    converted_papers.append((id_to_process, paper_fulltext, email_address[0:2]))
                else:
                    logger.info("Skipping paper without email address")
            else:
                logger.warning("Skipping paper with empty text")
        return converted_papers

    def get_fulltext_from_pdfs(self, paper_id):
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
        pdfs_urls = self.dbmanager.get_paper_pdf_paths(paper_id)
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
