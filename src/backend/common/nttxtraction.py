import base64
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
import yaml

from src.backend.common.apimanager import APIManager
from src.backend.common.dbmanager import DBManager
from src.backend.common.paperinfo import PaperInfo

SPECIES_ALIASES = {"9913": ["cow", "bovine", "calf"],
                   "7955": ["zebrafish"],
                   "7227": ["fruitfly", "fruitflies"],
                   "9606": ["human"],
                   "10090": ["mouse", "mice", "murine"],
                   "10116": ["rat"],
                   "559292": ["budding yeast"],
                   "4896": ["fission yeast"]}

OPENING_REGEX_STR = "[\\.\\n\\t\\'\\/\\(\\)\\[\\]\\{\\}:;\\,\\!\\?> ]"
CLOSING_REGEX_STR = "[\\.\\n\\t\\'\\/\\(\\)\\[\\]\\{\\}:;\\,\\!\\?> ]"


logger = logging.getLogger(__name__)


class NttExtractor(object):

    def __init__(self, tpc_token, dbname, user, password, host, config, tazendra_user, tazendra_password):
        self.api_manager = APIManager(tpc_token)
        self.db_name = dbname
        self.db_user = user
        self.db_password = password
        self.db_host = host
        self.tazendra_user = tazendra_user
        self.tazendra_password = tazendra_password
        db_manager = DBManager(self.db_name, self.db_user, self.db_password, self.db_host, self.tazendra_user,
                               self.tazendra_password)
        self.tot_num_documents = len(db_manager.get_set_of_curatable_papers())
        self.taxonid_name_map = db_manager.get_taxonid_speciesnamearr_map()
        db_manager.close()
        for taxon_id, species_alias_arr in SPECIES_ALIASES.items():
            self.taxonid_name_map[taxon_id].extend(species_alias_arr)
        self.taxonid_name_map = {species_id: regex_list for species_id, regex_list in self.taxonid_name_map.items()}
        for species_id, regex_list in self.taxonid_name_map.items():
            if len(regex_list[0].split(" ")) > 1:
                self.taxonid_name_map[species_id].append(regex_list[0][0] + "\\. " + " ".join(regex_list[0]
                                                                                              .split(" ")[1:]))
        self.config = config

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

    def extract_species(self, text: str, blacklist: List[str] = None, whitelist: List[str] = None, min_matches: int = 1,
                        tfidf_threshold: float = 0.0):
        blacklist = set(blacklist) if blacklist else set()
        whitelist = set(whitelist) if whitelist else set()
        return [regex_list[0].replace("\\", "") for taxon_id, regex_list in self.taxonid_name_map.items() if
                taxon_id not in blacklist and (taxon_id in whitelist or
                self.is_entity_meaningful(entity_keywords=regex_list, text=text, match_uppercase=False,
                                          min_num_occurrences=min_matches, tfidf_threshold=tfidf_threshold))]

    def extract_entities_from_text(self, papers_info):
        db_manager = DBManager(self.db_name, self.db_user, self.db_password, self.db_host, self.tazendra_user,
                               self.tazendra_password)
        genes = db_manager.get_all_genes()
        alleles = db_manager.get_all_alleles()
        strains = db_manager.get_all_alleles()
        transgenes = db_manager.get_all_transgenes()
        gene_symbol_id_map = db_manager.get_gene_name_id_map()
        gene_ids_cgc_name = db_manager.get_gene_cgc_name_from_id_map()
        allele_symbol_id_map = db_manager.get_allele_name_id_map()
        transgene_symbol_id_map = db_manager.get_transgene_name_id_map()
        db_manager.close()

        augmented_papers_info = []
        for paper_info in papers_info:
            logger.info("Processing paper " + paper_info.paper_id)
            logger.info("Getting list of genes through string matching")
            paper_info.genes = list(set(self.extract_keywords(
                genes, paper_info.fulltext, match_uppercase=True,
                min_matches=self.config["ntt_extraction"]["min_occurrences"]["gene"],
                blacklist=self.config["ntt_extraction"]["exclusion_list"]["gene"],
                tfidf_threshold=self.config["ntt_extraction"]["min_tfidf"]["gene"])) | set(
                self.extract_keywords(genes, paper_info.title, match_uppercase=True,
                                      blacklist=self.config["ntt_extraction"]["exclusion_list"]["gene"])) | set(
                self.extract_keywords(genes, paper_info.abstract, match_uppercase=True,
                                      blacklist=self.config["ntt_extraction"]["exclusion_list"]["gene"])))

            logger.info("Getting list of alleles through string matching")
            paper_info.alleles = list(set(self.extract_keywords(
                alleles, paper_info.fulltext, match_uppercase=True,
                min_matches=self.config["ntt_extraction"]["min_occurrences"]["allele"],
                blacklist=self.config["ntt_extraction"]["exclusion_list"]["allele"],
                tfidf_threshold=self.config["ntt_extraction"]["min_tfidf"]["allele"])) | set(
                self.extract_keywords(alleles, paper_info.title, match_uppercase=True,
                                      blacklist=self.config["ntt_extraction"]["exclusion_list"]["allele"])) | set(
                self.extract_keywords(alleles, paper_info.abstract, match_uppercase=True,
                                      blacklist=self.config["ntt_extraction"]["exclusion_list"]["allele"])))

            logger.info("Getting list of strains through string matching")
            paper_info.strains = list(set(self.extract_keywords(
                strains, paper_info.fulltext, match_uppercase=True,
                min_matches=self.config["ntt_extraction"]["min_occurrences"]["strain"],
                blacklist=self.config["ntt_extraction"]["exclusion_list"]["strain"],
                tfidf_threshold=self.config["ntt_extraction"]["min_tfidf"]["strain"])) | set(
                self.extract_keywords(strains, paper_info.title, match_uppercase=True,
                                      blacklist=self.config["ntt_extraction"]["exclusion_list"]["strain"])) | set(
                self.extract_keywords(strains, paper_info.abstract, match_uppercase=True,
                                      blacklist=self.config["ntt_extraction"]["exclusion_list"]["strain"])))

            logger.info("Getting list of transgenes through string matching")
            paper_info.transgenes = list(set(self.extract_keywords(
                transgenes, paper_info.fulltext, match_uppercase=True,
                min_matches=self.config["ntt_extraction"]["min_occurrences"]["transgene"],
                blacklist=self.config["ntt_extraction"]["exclusion_list"]["transgene"],
                tfidf_threshold=self.config["ntt_extraction"]["min_tfidf"]["transgene"])) | set(
                self.extract_keywords(transgenes, paper_info.title, match_uppercase=True,
                                      blacklist=self.config["ntt_extraction"]["exclusion_list"]["transgene"])) | set(
                self.extract_keywords(transgenes, paper_info.abstract, match_uppercase=True,
                                      blacklist=self.config["ntt_extraction"]["exclusion_list"]["transgene"])))

            logger.info("Getting list of species through string matching")
            paper_info.species = list(set(self.extract_species(
                paper_info.fulltext,
                min_matches=self.config["ntt_extraction"]["min_occurrences"]["species"],
                blacklist=self.config["ntt_extraction"]["exclusion_list"]["species"],
                whitelist=self.config["ntt_extraction"]["inclusion_list"]["species"],
                tfidf_threshold=self.config["ntt_extraction"]["min_tfidf"]["species"])) | set(
                self.extract_species(paper_info.title,
                                     blacklist=self.config["ntt_extraction"]["exclusion_list"]["species"],
                                     whitelist=self.config["ntt_extraction"]["inclusion_list"]["species"])) | set(
                self.extract_species(paper_info.abstract,
                                     blacklist=self.config["ntt_extraction"]["exclusion_list"]["species"],
                                     whitelist=self.config["ntt_extraction"]["inclusion_list"]["species"])))

            logger.info("Transforming gene keywords into gene ids")
            paper_info.genes = self.get_entity_ids_from_names(paper_info.genes, gene_symbol_id_map, gene_ids_cgc_name)
            logger.info("Transforming allele keywords into allele ids")
            paper_info.alleles = self.get_entity_ids_from_names(paper_info.genes, allele_symbol_id_map)
            logger.info("Transforming transgene keywords into transgene ids")
            paper_info.transgenes = self.get_entity_ids_from_names(paper_info.genes, transgene_symbol_id_map)
            augmented_papers_info.append(paper_info)
        return augmented_papers_info

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

    def extract_entities(self, paper_ids, max_num_papers):
        db_manager = DBManager(self.db_name, self.db_user, self.db_password, self.db_host, self.tazendra_user,
                               self.tazendra_password)
        logger.info("Getting papers fulltext and metadata")
        papers_info = []
        for paper_id, fulltext, (person_id, email) in self.get_first_valid_paper_ids_fulltexts_and_emails(
                paper_ids=paper_ids, max_papers=max_num_papers, db_manager=db_manager):
            paper_info = PaperInfo()
            paper_info.paper_id = paper_id
            paper_info.fulltext = fulltext
            paper_info.corresponding_author_email = email
            paper_info.corresponding_author_id = person_id
            paper_info.title = db_manager.get_paper_title(paper_id=paper_id)
            paper_info.journal = db_manager.get_paper_journal(paper_id)
            paper_info.pmid = db_manager.get_pmid(paper_id)
            paper_info.doi = db_manager.get_doi_from_paper_id(paper_id)
            paper_info.abstract = db_manager.get_paper_abstract(paper_id)
            papers_info.append(paper_info)
        db_manager.close()
        return self.extract_entities_from_text(papers_info=papers_info)

    def get_processable_papers(self):
        db_manager = DBManager(self.db_name, self.db_user, self.db_password, self.db_host, self.tazendra_user,
                               self.tazendra_password)
        logger.info("Getting the list of curatable papers from WormBase DB")
        curatable_papers = db_manager.get_set_of_curatable_papers()
        logger.debug("Number of curatable papers: " + str(len(curatable_papers)))

        logger.info("Getting the list of papers that have already been processed by AFP - either emailed or not")
        processed_papers = db_manager.get_set_of_afp_processed_papers()
        logger.debug("Number of papers that have already been processed by AFP: " + str(len(processed_papers)))

        curatable_papers_not_processed = curatable_papers - processed_papers
        logger.debug("Number of curatable papers not yet emailed to authors: " +
                     str(len(curatable_papers_not_processed)))

        logger.info("Getting the list of papers that are flagged by an SVM")
        papers_svm_flags = db_manager.get_svm_flagged_papers()
        logger.debug("Number of SVM flagged papers: " + str(len(papers_svm_flags)))

        curatable_papers_not_processed_svm_flagged = sorted(list(curatable_papers_not_processed &
                                                                 set(papers_svm_flags.keys())),
                                                            reverse=True)
        logger.debug("Number of papers curatable, not emailed, and SVM flagged: " +
                     str(len(curatable_papers_not_processed_svm_flagged)))
        db_manager.close()
        return curatable_papers_not_processed_svm_flagged

    @staticmethod
    def get_first_valid_email_address_from_paper(fulltext, paper_id, db_manager):
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
                    return person_id, curr_address if curr_address else person_id, address
        return None

    def get_first_valid_paper_ids_fulltexts_and_emails(self, paper_ids: List[str], db_manager: DBManager,
                                                       max_papers: int = 50):
        converted_papers = []
        while len(converted_papers) < max_papers and len(paper_ids) > 0:
            id_to_process = paper_ids.pop(0)
            logger.info("Extracting fulltext for paper " + id_to_process)
            paper_fulltext = self.get_fulltext_from_pdfs(paper_id=id_to_process, db_manager=db_manager)
            if paper_fulltext != "":
                logger.info("Extracting email address from paper")
                email_address = self.get_first_valid_email_address_from_paper(
                    fulltext=paper_fulltext, paper_id=id_to_process, db_manager=db_manager)
                if email_address:
                    converted_papers.append((id_to_process, paper_fulltext, email_address[0:2]))
                else:
                    logger.info("Skipping paper without email address")
            else:
                logger.warning("Skipping paper with empty text")
        return converted_papers

    def get_fulltext_from_pdfs(self, paper_id, db_manager: DBManager):
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
            request = urllib.request.Request(pdf_url)
            base64string = base64.b64encode(bytes('%s:%s' % (self.tazendra_user, self.tazendra_password), 'ascii'))
            request.add_header("Authorization", "Basic %s" % base64string.decode('utf-8'))
            with urllib.request.urlopen(request) as response:
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
        pdfs_urls = db_manager.get_paper_pdf_paths(paper_id)
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
