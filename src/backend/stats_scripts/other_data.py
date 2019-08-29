#!/usr/bin/env python3

import argparse
import json

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
    num_new_alleles = []
    num_new_strains = []
    num_new_transgenes = []
    num_other_antibodies = []

    checked_gene_correction = []
    checked_new_antibodies = []
    checked_siteaction = []
    checked_timeaction = []
    checked_rnaseq = []
    checked_additionalexpr = []
    checked_chemphen = []
    checked_envphen = []
    checked_catalyticact = []
    checked_disease = []
    checked_comments = []

    for paper_id in list_ids:
        num_new_alleles.append(len([rec for rec in json.loads(db_manager.get_feature("afp_othervariation", paper_id))
                                    if rec["name"] != ""]))
        num_new_strains.append(len([rec for rec in json.loads(db_manager.get_feature("afp_otherstrain", paper_id))
                                    if rec["name"] != ""]))
        num_new_transgenes.append(len([rec for rec in json.loads(db_manager.get_feature("afp_othertransgene", paper_id))
                                       if rec["name"] != ""]))
        num_other_antibodies.append(len([rec for rec in json.loads(db_manager.get_feature(
            "afp_otherantibody", paper_id)) if rec["name"] != ""]))

        afp_modchange = db_manager.get_feature("afp_structcorr", paper_id)
        checked_gene_correction.append(1 if afp_modchange != '' and afp_modchange != 'null' else 0)
        afp_newantibody = db_manager.get_feature("afp_antibody", paper_id)
        checked_new_antibodies.append(1 if afp_newantibody != '' and afp_newantibody != 'null' else 0)
        afp_siteaction = db_manager.get_feature("afp_siteaction", paper_id)
        checked_siteaction.append(1 if afp_siteaction != '' and afp_siteaction != 'null' else 0)
        afp_timeaction = db_manager.get_feature("afp_timeaction", paper_id)
        checked_timeaction.append(1 if afp_timeaction != '' and afp_timeaction != 'null' else 0)
        afp_rnaseq = db_manager.get_feature("afp_rnaseq", paper_id)
        checked_rnaseq.append(1 if afp_rnaseq != '' and afp_rnaseq != 'null' else 0)
        afp_chemphen = db_manager.get_feature("afp_chemphen", paper_id)
        checked_chemphen.append(1 if afp_chemphen != '' and afp_chemphen != 'null' else 0)
        afp_envpheno = db_manager.get_feature("afp_envpheno", paper_id)
        checked_envphen.append(1 if afp_envpheno != '' and afp_envpheno != 'null' else 0)
        afp_catalyticact = db_manager.get_feature("afp_catalyticact", paper_id)
        checked_catalyticact.append(1 if afp_catalyticact != '' and afp_catalyticact != 'null' else 0)
        afp_humdis = db_manager.get_feature("afp_humdis", paper_id)
        checked_disease.append(1 if afp_humdis != '' and afp_humdis != 'null' else 0)
        afp_additionalexpr = db_manager.get_feature("afp_additionalexpr", paper_id)
        checked_additionalexpr.append(1 if afp_additionalexpr != '' and afp_additionalexpr != 'null' else 0)
        afp_comments = db_manager.get_feature("afp_comment", paper_id)
        checked_comments.append(1 if afp_comments != '' and afp_comments != 'null' else 0)

    print("Number of new entities provided per submission:")
    print("New alleles", str(np.average(num_new_alleles)))
    print("New strains", str(np.average(num_new_strains)))
    print("New transgenes", str(np.average(num_new_transgenes)))
    print("New antibodies", str(np.average(num_other_antibodies)))

    print("Percentage of submissions with checked data types:")
    print("Gene model correction/update", str(np.average(checked_gene_correction)))
    print("New antibody", str(np.average(checked_new_antibodies)))
    print("Site of action", str(np.average(checked_siteaction)))
    print("Time of action", str(np.average(checked_timeaction)))
    print("RNAseq data", str(np.average(checked_rnaseq)))
    print("Additional type of expression data", str(np.average(checked_additionalexpr)))
    print("Chemical induced phenotype", str(np.average(checked_chemphen)))
    print("Environmental induced phenotype", str(np.average(checked_envphen)))
    print("Enzymatic activity", str(np.average(checked_catalyticact)))
    print("Human disease model", str(np.average(checked_disease)))
    print("Comments", str(np.average(checked_comments)))


if __name__ == '__main__':
    main()
