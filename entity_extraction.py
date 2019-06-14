import copy
import logging
import re
import shutil
from typing import Dict, Set, List

import PyPDF2 as PyPDF2
from PyPDF2.generic import TextStringObject
from PyPDF2.pdf import ContentStream, b_, FloatObject, NumberObject
from PyPDF2.utils import u_
import urllib.request
from db_manager import DBManager
import tempfile


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


logger = logging.getLogger(__name__)


def get_matches_in_fulltext(fulltext_str, keywords, papers_map, paper_id, min_num_occurrences,
                            match_uppercase: bool = False):
    for keyword in keywords:
        if keyword in fulltext_str or match_uppercase and keyword.upper() in fulltext_str:
            try:
                match_counter = len(re.findall(OPENING_REGEX_STR + re.escape(keyword) + CLOSING_REGEX_STR,
                                               fulltext_str))
                if match_uppercase and keyword.upper() != keyword:
                    match_counter += len(re.findall(OPENING_REGEX_STR + re.escape(keyword.upper()) +
                                                    CLOSING_REGEX_STR, fulltext_str))
                if match_counter >= min_num_occurrences:
                    papers_map[paper_id].add(keyword)
            except:
                pass


def get_species_in_fulltext_from_regex(fulltext: str, papers_map: Dict[str, Set[str]], paper_id: str,
                                       taxon_name_map: Dict[str, List[str]], min_occurrences: int = 1):
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
            if num_occurrences >= min_occurrences:
                papers_map[paper_id].add(regex_list_mod[0].replace("\\", ""))


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

    complete_fulltext = ""
    for pdf_url in pdfs_urls:
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
            complete_fulltext += pdf_fulltext
        else:
            logger.info("Skipping response to reviewers")
    complete_fulltext = complete_fulltext.replace("\n", " ")
    return complete_fulltext
