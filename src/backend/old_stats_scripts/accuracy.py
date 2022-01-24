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
    parser.add_argument("-i", "--paper-ids", metavar="paper_ids", dest="paper_ids", type=str, nargs="+",
                        help="limit the analysis to the specified paper ids")
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
    if args.paper_ids:
        set_pap_ids = args.paper_ids
        list_ids = [pap_id for pap_id in list_ids if pap_id in set_pap_ids]
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
    tp_alleleseqchange = 0
    tn_alleleseqchange = 0
    fp_alleleseqchange = 0
    fn_alleleseqchange = 0
    tp_anatomicexpr = 0
    tn_anatomicexpr = 0
    fp_anatomicexpr = 0
    fn_anatomicexpr = 0
    tp_geneticint = 0
    tn_geneticint = 0
    fp_geneticint = 0
    fn_geneticint = 0
    tp_physint = 0
    tn_physint = 0
    fp_physint = 0
    fn_physint = 0
    tp_regulint = 0
    tn_regulint = 0
    fp_regulint = 0
    fn_regulint = 0
    tp_allelepheno = 0
    tn_allelepheno = 0
    fp_allelepheno = 0
    fn_allelepheno = 0
    tp_rnaipheno = 0
    tn_rnaipheno = 0
    fp_rnaipheno = 0
    fn_rnaipheno = 0
    tp_transgeneoverexprpheno = 0
    tn_transgeneoverexprpheno = 0
    fp_transgeneoverexprpheno = 0
    fn_transgeneoverexprpheno = 0
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
        if svm_seqchange == 1 and afp_seqchange == 1:
            tp_alleleseqchange += 1
        elif svm_seqchange == 0 and afp_seqchange == 1:
            fn_alleleseqchange += 1
        elif svm_seqchange == 1 and afp_seqchange == 0:
            fp_alleleseqchange += 1
        elif svm_seqchange == 0 and afp_seqchange == 0:
            tn_alleleseqchange += 1
        svm_otherexpr = db_manager.get_svm_value("otherexpr", paper_id)
        afp_otherexpr = db_manager.get_feature("afp_otherexpr", paper_id)
        afp_otherexpr = afp_otherexpr != '' and afp_otherexpr != 'null'
        accuracy_anatomicexpr.append(1 if svm_otherexpr == afp_otherexpr else 0)
        if svm_otherexpr == 1 and afp_otherexpr == 1:
            tp_anatomicexpr += 1
        elif svm_otherexpr == 0 and afp_otherexpr == 1:
            fn_anatomicexpr += 1
        elif svm_otherexpr == 1 and afp_otherexpr == 0:
            fp_anatomicexpr += 1
        elif svm_otherexpr == 0 and afp_otherexpr == 0:
            tn_anatomicexpr += 1
        svm_geneint = db_manager.get_svm_value("geneint", paper_id)
        afp_geneint = db_manager.get_feature("afp_geneint", paper_id)
        afp_geneint = afp_geneint != '' and afp_geneint != 'null'
        accuracy_geneticint.append(1 if svm_geneint == afp_geneint else 0)
        if svm_geneint == 1 and afp_geneint == 1:
            tp_geneticint += 1
        elif svm_geneint == 0 and afp_geneint == 1:
            fn_geneticint += 1
        elif svm_geneint == 1 and afp_geneint == 0:
            fp_geneticint += 1
        elif svm_geneint == 0 and afp_geneint == 0:
            tn_geneticint += 1
        svm_geneprod = db_manager.get_svm_value("geneprod", paper_id)
        afp_geneprod = db_manager.get_feature("afp_geneprod", paper_id)
        afp_geneprod = afp_geneprod != '' and afp_geneprod != 'null'
        accuracy_physint.append(1 if svm_geneprod == afp_geneprod else 0)
        if svm_geneprod == 1 and afp_geneprod == 1:
            tp_physint += 1
        elif svm_geneprod == 0 and afp_geneprod == 1:
            fn_physint += 1
        elif svm_geneprod == 1 and afp_geneprod == 0:
            fp_physint += 1
        elif svm_geneprod == 0 and afp_geneprod == 0:
            tn_physint += 1
        svm_genereg = db_manager.get_svm_value("genereg", paper_id)
        afp_genereg = db_manager.get_feature("afp_genereg", paper_id)
        afp_genereg = afp_genereg != '' and afp_genereg != 'null'
        accuracy_regulint.append(1 if svm_genereg == afp_genereg else 0)
        if svm_genereg == 1 and afp_genereg == 1:
            tp_regulint += 1
        elif svm_genereg == 0 and afp_genereg == 1:
            fn_regulint += 1
        elif svm_genereg == 1 and afp_genereg == 0:
            fp_regulint += 1
        elif svm_genereg == 0 and afp_genereg == 0:
            tn_regulint += 1
        svm_newmutant = db_manager.get_svm_value("newmutant", paper_id)
        afp_newmutant = db_manager.get_feature("afp_newmutant", paper_id)
        afp_newmutant = afp_newmutant != '' and afp_newmutant != 'null'
        accuracy_allelepheno.append(1 if svm_newmutant == afp_newmutant else 0)
        if svm_newmutant == 1 and afp_newmutant == 1:
            tp_allelepheno += 1
        elif svm_newmutant == 0 and afp_newmutant == 1:
            fn_allelepheno += 1
        elif svm_newmutant == 1 and afp_newmutant == 0:
            fp_allelepheno += 1
        elif svm_newmutant == 0 and afp_newmutant == 0:
            tn_allelepheno += 1
        svm_rnai = db_manager.get_svm_value("rnai", paper_id)
        afp_rnai = db_manager.get_feature("afp_rnai", paper_id)
        afp_rnai = afp_rnai != '' and afp_rnai != 'null'
        accuracy_rnaipheno.append(1 if svm_rnai == afp_rnai else 0)
        if svm_rnai == 1 and afp_rnai == 1:
            tp_rnaipheno += 1
        elif svm_rnai == 0 and afp_rnai == 1:
            fn_rnaipheno += 1
        elif svm_rnai == 1 and afp_rnai == 0:
            fp_rnaipheno += 1
        elif svm_rnai == 0 and afp_rnai == 0:
            tn_rnaipheno += 1
        svm_overexpr = db_manager.get_svm_value("overexpr", paper_id)
        afp_overexpr = db_manager.get_feature("afp_overexpr", paper_id)
        afp_overexpr = afp_overexpr != '' and afp_overexpr != 'null'
        accuracy_transgeneoverexprpheno.append(1 if svm_overexpr == afp_overexpr else 0)
        if svm_overexpr == 1 and afp_overexpr == 1:
            tp_transgeneoverexprpheno += 1
        elif svm_overexpr == 0 and afp_overexpr == 1:
            fn_transgeneoverexprpheno += 1
        elif svm_overexpr == 1 and afp_overexpr == 0:
            fp_transgeneoverexprpheno += 1
        elif svm_overexpr == 0 and afp_overexpr == 0:
            tn_transgeneoverexprpheno += 1

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

    print("Precision indices:")
    print("Allele sequence change", str(tp_alleleseqchange / (tp_alleleseqchange + fp_alleleseqchange)))
    print("Anatomic expression in WT condition", str(tp_anatomicexpr / (tp_anatomicexpr + fp_anatomicexpr)))
    print("Genetic interactions", str(tp_geneticint / (tp_geneticint + fp_geneticint)))
    print("Physical interactions", str(tp_physint / (tp_physint + fp_physint)))
    print("Regulatory interactions", str(tp_regulint / (tp_regulint + fp_regulint)))
    print("Allele phenotype", str(tp_allelepheno / (tp_allelepheno + fp_allelepheno)))
    print("RNAi phenotype", str(tp_rnaipheno / (tp_rnaipheno + fp_rnaipheno)))
    print("Transgene overexpression phenotype", str(tp_transgeneoverexprpheno / (tp_transgeneoverexprpheno + fp_transgeneoverexprpheno)))

    print("Recall indices:")
    print("Allele sequence change", str(tp_alleleseqchange / (tp_alleleseqchange + fn_alleleseqchange)))
    print("Anatomic expression in WT condition", str(tp_anatomicexpr / (tp_anatomicexpr + fn_anatomicexpr)))
    print("Genetic interactions", str(tp_geneticint / (tp_geneticint + fn_geneticint)))
    print("Physical interactions", str(tp_physint / (tp_physint + fn_physint)))
    print("Regulatory interactions", str(tp_regulint / (tp_regulint + fn_regulint)))
    print("Allele phenotype", str(tp_allelepheno / (tp_allelepheno + fn_allelepheno)))
    print("RNAi phenotype", str(tp_rnaipheno / (tp_rnaipheno + fn_rnaipheno)))
    print("Transgene overexpression phenotype", str(tp_transgeneoverexprpheno / (tp_transgeneoverexprpheno + fn_transgeneoverexprpheno)))


if __name__ == '__main__':
    main()
