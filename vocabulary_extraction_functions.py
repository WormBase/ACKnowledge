import logging
import re

from tqdm import tqdm

SPECIES_ALIASES = {"9913": ["cow", "bovine", "calf"],
                   "7955": ["zebrafish"],
                   "7227": ["fruitfly", "fruitflies"],
                   "9606": ["human"],
                   "10090": ["mouse", "mice", "murine"],
                   "10116": ["rat"],
                   "559292": ["yeast", "budding yeast"],
                   "4896": ["fission yeast"]}


class TqdmHandler(logging.StreamHandler):
    def __init__(self):
        logging.StreamHandler.__init__(self)

    def emit(self, record):
        msg = self.format(record)
        tqdm.write(msg)


def get_matches_in_fulltext(fulltext_str, keywords, papers_map, paper_id, min_num_occurrences):
    logger = logging.getLogger("AFP vocabulary extraction")
    logger.addHandler(TqdmHandler)
    fulltext_copy = fulltext_str
    for keyword in tqdm(keywords):
        try:
            regx = re.compile("[\\.\\n\\t\\'\\/\\(\\)\\[\\]\\{\\}:;\\,\\!\\?> ]" + keyword +
                              "[\\.\\n\\t\\'\\/\\(\\)\\[\\]\\{\\}:;\\,\\!\\?> ]")
            matches = re.findall(regx, fulltext_copy)
            if len(matches) >= min_num_occurrences:
                papers_map[paper_id].append(keyword)
        except:
            pass


def get_species_in_fulltext_from_regex(fulltext, papers_map, paper_id, taxon_name_map, min_occurrences: int = 1):
    for taxon_id, species_alias_arr in SPECIES_ALIASES.items():
        taxon_name_map[taxon_id].extend(species_alias_arr)
    for species_id, regex_list in tqdm(taxon_name_map.items()):
        regex_list_mod = [regex_list[0], regex_list[0][0] + "\\. " + " ".join(regex_list[0].split(" ")[1:])]
        if len(regex_list) > 1:
            regex_list_mod.extend(regex_list[1:])
        for regex_text in regex_list_mod:
            if len(re.findall(re.compile("[\\.\\n\\t\\'\\/\\(\\[\\{:;\\,\\!\\?> ]" + regex_text.lower() +
                                         "[\\.\\n\\t\\'\\/\\)\\]\\}:;\\,\\!\\?< ]"), fulltext.lower())) >= \
                    min_occurrences:
                papers_map[paper_id].append(species_id + ";%;" + regex_list_mod[1].replace("\\", ""))

