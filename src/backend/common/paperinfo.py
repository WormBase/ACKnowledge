import numpy as np

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
    abstract: str
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


def print_papers_stats(papers_info: List[PaperInfo], num_papers: int):
    print("Statistics calculated on the latest set of " + str(num_papers) + " papers that can be processed by AFP")
    print()
    print("Number of fulltexts successfully extracted with corresponding author registered at WB: " +
          str(len(papers_info)))
    print("Number of papers with non-empty entity lists: " + str(len(
        [paper_info for paper_info in papers_info if paper_info.entities_not_empty()])))
    print("Average number of genes extracted: " + str(np.average(
        [len(paper_info.genes) if paper_info.genes else 0 for paper_info in papers_info])))
    print("Average number of species extracted: " + str(np.average(
        [len(paper_info.species) if paper_info.species else 0 for paper_info in papers_info])))
    print("Average number of alleles extracted: " + str(np.average(
        [len(paper_info.alleles) if paper_info.alleles else 0 for paper_info in papers_info])))
    print("Average number of transgenes extracted: " + str(np.average(
        [len(paper_info.transgenes) if paper_info.transgenes else 0 for paper_info in papers_info])))
    print("Average number of strains extracted: " + str(np.average(
        [len(paper_info.strains) if paper_info.strains else 0 for paper_info in papers_info])))
