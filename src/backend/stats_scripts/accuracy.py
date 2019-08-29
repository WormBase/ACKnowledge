#!/usr/bin/env python3

import argparse
from src.backend.common.nttxtraction import *
from src.backend.common.dbmanager import DBManager
import numpy as np


logger = logging.getLogger(__name__)


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    db_manager = DBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    list_ids = db_manager.get_list_paper_ids_afp_submitted(0, 100000)
    jaccard_genes = []
    jaccard_species = []
    jaccard_alleles = []
    jaccard_strains = []
    jaccard_transgenes = []
    for paper_id in list_ids:
        tfp_genestudied = [gene_str.split(";%;")[0] for gene_str in
                           db_manager.get_feature("tfp_genestudied", paper_id).split("|")]
        afp_genestudied = [gene_str.split(";%;")[0] for gene_str in
                           db_manager.get_feature("afp_genestudied", paper_id).split("|")]
        jaccard_genes.append(len(set(tfp_genestudied) & set(afp_genestudied)) / len(set(tfp_genestudied) |
                                                                                    set(afp_genestudied)))
        tfp_species = [species_str.split(";%;")[0] for species_str in
                       db_manager.get_feature("tfp_species", paper_id).split("|")]
        afp_species = [species_str.split(";%;")[0] for species_str in
                       db_manager.get_feature("afp_species", paper_id).split("|")]
        jaccard_species.append(len(set(tfp_species) & set(afp_species)) / len(set(tfp_species) | set(afp_species)))
        tfp_alleles = [alleles_str.split(";%;")[0] for alleles_str in
                       db_manager.get_feature("tfp_variation", paper_id).split("|")]
        afp_alleles = [alleles_str.split(";%;")[0] for alleles_str in
                       db_manager.get_feature("afp_variation", paper_id).split("|")]
        jaccard_alleles.append(len(set(tfp_alleles) & set(afp_alleles)) / len(set(tfp_alleles) | set(afp_alleles)))
        tfp_strains = [strains_str.split(";%;")[0] for strains_str in
                       db_manager.get_feature("tfp_strain", paper_id).split("|")]
        afp_strains = [strains_str.split(";%;")[0] for strains_str in
                       db_manager.get_feature("afp_strain", paper_id).split("|")]
        jaccard_strains.append(len(set(tfp_strains) & set(afp_strains)) / len(set(tfp_strains) | set(afp_strains)))
        tfp_transgenes = [transgenes_str.split(";%;")[0] for transgenes_str in
                       db_manager.get_feature("tfp_transgene", paper_id).split("|")]
        afp_transgenes = [transgenes_str.split(";%;")[0] for transgenes_str in
                       db_manager.get_feature("afp_transgene", paper_id).split("|")]
        jaccard_transgenes.append(len(set(tfp_transgenes) & set(afp_transgenes)) / len(set(tfp_transgenes) | set(afp_transgenes)))

    print("Jaccard indices: ")
    print("genes", str(np.average(jaccard_genes)))
    print("species", str(np.average(jaccard_species)))
    print("alleles", str(np.average(jaccard_alleles)))
    print("strains", str(np.average(jaccard_strains)))
    print("transgenes", str(np.average(jaccard_transgenes)))


if __name__ == '__main__':
    main()
