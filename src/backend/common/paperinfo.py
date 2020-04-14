from dataclasses import dataclass
from typing import List


@dataclass(init=False)
class PaperInfo:
    paper_id: str
    fulltext: str
    title: str
    journal: str
    pmid: str
    doi: str
    corresponding_author_email: str
    corresponding_author_id: str
    genes: List[str]
    species: List[str]
    alleles: List[str]
    strains: List[str]
    transgenes: List[str]
    passwd: str

    def entities_not_empty(self):
        return self.genes and self.alleles and self.transgenes and self.strains
