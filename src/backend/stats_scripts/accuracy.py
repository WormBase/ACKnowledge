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
    accuracy_alleleseqchange = []
    accuracy_anatomicexpr = []
    accuracy_geneticint = []
    accuracy_physint = []
    accuracy_regulint = []
    accuracy_allelepheno = []
    accuracy_rnaipheno = []
    accuracy_transgeneoverexprpheno = []
    num_added_genes = []
    num_added_species = []
    num_added_alleles = []
    num_added_strains = []
    num_added_transgenes = []
    num_removed_genes = []
    num_removed_species = []
    num_removed_alleles = []
    num_removed_strains = []
    num_removed_transgenes = []

    for paper_id in list_ids:
        tfp_genestudied = [gene_str.split(";%;")[0] for gene_str in
                           db_manager.get_feature("tfp_genestudied", paper_id).split("|")]
        afp_genestudied = [gene_str.split(";%;")[0] for gene_str in
                           db_manager.get_feature("afp_genestudied", paper_id).split("|")]
        jaccard_genes.append(len(set(tfp_genestudied) & set(afp_genestudied)) / len(set(tfp_genestudied) |
                                                                                    set(afp_genestudied)))
        num_removed_genes.append(len(set(tfp_genestudied) - set(afp_genestudied)))
        num_added_genes.append(len(set(afp_genestudied) - set(tfp_genestudied)))

        tfp_species = [species_str.split(";%;")[0] for species_str in
                       db_manager.get_feature("tfp_species", paper_id).split("|")]
        afp_species = [species_str.split(";%;")[0] for species_str in
                       db_manager.get_feature("afp_species", paper_id).split("|")]
        jaccard_species.append(len(set(tfp_species) & set(afp_species)) / len(set(tfp_species) | set(afp_species)))
        num_removed_species.append(len(set(tfp_species) - set(afp_species)))
        num_added_species.append(len(set(afp_species) - set(tfp_species)))

        tfp_alleles = [alleles_str.split(";%;")[0] for alleles_str in
                       db_manager.get_feature("tfp_variation", paper_id).split("|")]
        afp_alleles = [alleles_str.split(";%;")[0] for alleles_str in
                       db_manager.get_feature("afp_variation", paper_id).split("|")]
        jaccard_alleles.append(len(set(tfp_alleles) & set(afp_alleles)) / len(set(tfp_alleles) | set(afp_alleles)))
        num_removed_alleles.append(len(set(tfp_alleles) - set(afp_alleles)))
        num_added_alleles.append(len(set(afp_alleles) - set(tfp_alleles)))

        tfp_strains = [strains_str.split(";%;")[0] for strains_str in
                       db_manager.get_feature("tfp_strain", paper_id).split("|")]
        afp_strains = [strains_str.split(";%;")[0] for strains_str in
                       db_manager.get_feature("afp_strain", paper_id).split("|")]
        jaccard_strains.append(len(set(tfp_strains) & set(afp_strains)) / len(set(tfp_strains) | set(afp_strains)))
        num_removed_strains.append(len(set(tfp_strains) - set(afp_strains)))
        num_added_strains.append(len(set(afp_strains) - set(tfp_strains)))

        tfp_transgenes = [transgenes_str.split(";%;")[0] for transgenes_str in
                       db_manager.get_feature("tfp_transgene", paper_id).split("|")]
        afp_transgenes = [transgenes_str.split(";%;")[0] for transgenes_str in
                       db_manager.get_feature("afp_transgene", paper_id).split("|")]
        jaccard_transgenes.append(len(set(tfp_transgenes) & set(afp_transgenes)) / len(set(tfp_transgenes) | set(afp_transgenes)))
        num_removed_transgenes.append(len(set(tfp_transgenes) - set(afp_transgenes)))
        num_added_transgenes.append(len(set(afp_transgenes) - set(tfp_transgenes)))

        svm_seqchange = db_manager.get_svm_value("seqchange", paper_id)
        afp_seqchange = db_manager.get_feature("afp_seqchange", paper_id)
        afp_seqchange = afp_seqchange != '' and afp_seqchange != 'null'
        accuracy_alleleseqchange.append(1 if svm_seqchange == afp_seqchange else 0)
        svm_otherexpr = db_manager.get_svm_value("otherexpr", paper_id)
        afp_otherexpr = db_manager.get_feature("afp_otherexpr", paper_id)
        afp_otherexpr = afp_otherexpr != '' and afp_otherexpr != 'null'
        accuracy_anatomicexpr.append(1 if svm_otherexpr == afp_otherexpr else 0)
        svm_geneint = db_manager.get_svm_value("geneint", paper_id)
        afp_geneint = db_manager.get_feature("afp_geneint", paper_id)
        afp_geneint = afp_geneint != '' and afp_geneint != 'null'
        accuracy_geneticint.append(1 if svm_geneint == afp_geneint else 0)
        svm_geneprod = db_manager.get_svm_value("geneprod", paper_id)
        afp_geneprod = db_manager.get_feature("afp_geneprod", paper_id)
        afp_geneprod = afp_geneprod != '' and afp_geneprod != 'null'
        accuracy_physint.append(1 if svm_geneprod == afp_geneprod else 0)
        svm_genereg = db_manager.get_svm_value("genereg", paper_id)
        afp_genereg = db_manager.get_feature("afp_genereg", paper_id)
        afp_genereg = afp_genereg != '' and afp_genereg != 'null'
        accuracy_regulint.append(1 if svm_genereg == afp_genereg else 0)
        svm_newmutant = db_manager.get_svm_value("newmutant", paper_id)
        afp_newmutant = db_manager.get_feature("afp_newmutant", paper_id)
        afp_newmutant = afp_newmutant != '' and afp_newmutant != 'null'
        accuracy_allelepheno.append(1 if svm_newmutant == afp_newmutant else 0)
        svm_rnai = db_manager.get_svm_value("rnai", paper_id)
        afp_rnai = db_manager.get_feature("afp_rnai", paper_id)
        afp_rnai = afp_rnai != '' and afp_rnai != 'null'
        accuracy_rnaipheno.append(1 if svm_rnai == afp_rnai else 0)
        svm_overexpr = db_manager.get_svm_value("overexpr", paper_id)
        afp_overexpr = db_manager.get_feature("afp_overexpr", paper_id)
        afp_overexpr = afp_overexpr != '' and afp_overexpr != 'null'
        accuracy_transgeneoverexprpheno.append(1 if svm_overexpr == afp_overexpr else 0)

    print("Jaccard indices:")
    print("genes", str(np.average(jaccard_genes)))
    print("species", str(np.average(jaccard_species)))
    print("alleles", str(np.average(jaccard_alleles)))
    print("strains", str(np.average(jaccard_strains)))
    print("transgenes", str(np.average(jaccard_transgenes)))

    print("Number of added entities")
    print("genes", str(np.average(num_added_genes)))
    print("species", str(np.average(num_added_species)))
    print("alleles", str(np.average(num_added_alleles)))
    print("strains", str(np.average(num_added_strains)))
    print("transgenes", str(np.average(num_added_transgenes)))

    print("Number of removed entities")
    print("genes", str(np.average(num_removed_genes)))
    print("species", str(np.average(num_removed_species)))
    print("alleles", str(np.average(num_removed_alleles)))
    print("strains", str(np.average(num_removed_strains)))
    print("transgenes", str(np.average(num_removed_transgenes)))

    print("Accuracy indices:")
    print("Allele sequence change", str(np.average(accuracy_alleleseqchange)))
    print("Anatomic expression in WT condition", str(np.average(accuracy_anatomicexpr)))
    print("Genetic interactions", str(np.average(accuracy_geneticint)))
    print("Physical interactions", str(np.average(accuracy_physint)))
    print("Regulatory interactions", str(np.average(accuracy_regulint)))
    print("Allele phenotype", str(np.average(accuracy_allelepheno)))
    print("RNAi phenotype", str(np.average(accuracy_rnaipheno)))
    print("Transgene overexpression phenotype", str(np.average(accuracy_transgeneoverexprpheno)))


if __name__ == '__main__':
    main()
