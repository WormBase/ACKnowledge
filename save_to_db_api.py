#!/usr/bin/env python3

import argparse
import logging
import falcon
from wsgiref import simple_server
from db_manager import DBManager
from falcon import HTTPStatus


class StorageEngine(object):

    def __init__(self, dbname, user, password, host):
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host
        self.db_manager = None

    def __enter__(self):
        self.db_manager = DBManager(self.dbname, self.user, self.password, self.host)

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.db_manager.close()

    def get_paper_id_from_passwd(self, passwd):
        return self.db_manager.get_paper_id_from_passwd(passwd)

    # Overview

    def store_genes_list(self, genes, paper_id):
        self.db_manager.set_gene_list(genes=genes, paper_id=paper_id)

    def store_gene_model_update(self, gene_model_string, paper_id):
        self.db_manager.set_gene_model_update(gene_model_update=gene_model_string, paper_id=paper_id)

    def store_species_list(self, species, paper_id):
        self.db_manager.set_species_list(species=species, paper_id=paper_id)

    # Genetics

    def store_alleles_list(self, alleles, paper_id):
        self.db_manager.set_alleles_list(alleles=alleles, paper_id=paper_id)

    def store_allele_seq_change(self, allele_seq_change, paper_id):
        self.db_manager.set_allele_seq_change(allele_seq_change=allele_seq_change, paper_id=paper_id)

    def store_other_alleles(self, other_alleles, paper_id):
        self.db_manager.set_other_alleles(other_alleles=other_alleles, paper_id=paper_id)

    def store_strains_list(self, strains, paper_id):
        self.db_manager.set_strains_list(strains=strains, paper_id=paper_id)

    def store_other_strains(self, other_strains, paper_id):
        self.db_manager.set_other_strains(other_strains=other_strains, paper_id=paper_id)

    # Reagent

    def store_transgenes_list(self, transgenes, paper_id):
        self.db_manager.set_transgenes_list(transgenes=transgenes, paper_id=paper_id)

    def store_new_transgenes(self, new_transgenes, paper_id):
        self.db_manager.set_new_transgenes(new_transgenes=new_transgenes, paper_id=paper_id)

    def store_new_antibody(self, new_antibody, paper_id):
        self.db_manager.set_new_antibody(new_antibody=new_antibody, paper_id=paper_id)

    def store_other_antibodies(self, other_antibodies, paper_id):
        self.db_manager.set_other_antibodies(other_antibodies=other_antibodies, paper_id=paper_id)

    # Expression

    def store_anatomic_expr(self, anatomic_expr, paper_id):
        self.db_manager.set_anatomic_expr(anatomic_expr=anatomic_expr, paper_id=paper_id)

    def store_site_action(self, site_action, paper_id):
        self.db_manager.set_site_action(site_action=site_action, paper_id=paper_id)

    def store_time_action(self, time_action, paper_id):
        self.db_manager.set_time_action(time_action=time_action, paper_id=paper_id)

    def store_rnaseq(self, rnaseq, paper_id):
        self.db_manager.set_rnaseq(rnaseq=rnaseq, paper_id=paper_id)

    def store_additional_expr(self, additional_expr, paper_id):
        self.db_manager.set_additional_expr(additional_expr=additional_expr, paper_id=paper_id)

    # Interactions

    def store_gene_int(self, gene_int, paper_id):
        self.db_manager.set_gene_int(gene_int=gene_int, paper_id=paper_id)

    def store_phys_int(self, phys_int, paper_id):
        self.db_manager.set_phys_int(phys_int=phys_int, paper_id=paper_id)

    def store_gene_reg(self, gene_reg, paper_id):
        self.db_manager.set_gene_reg(gene_reg=gene_reg, paper_id=paper_id)

    # Phenotypes

    def store_allele_pheno(self, allele_pheno, paper_id):
        self.db_manager.set_allele_pheno(allele_pheno=allele_pheno, paper_id=paper_id)

    def store_rnai_pheno(self, rnai_pheno, paper_id):
        self.db_manager.set_rnai_pheno(rnai_pheno=rnai_pheno, paper_id=paper_id)

    def store_transover_pheno(self, transover_pheno, paper_id):
        self.db_manager.set_transover_pheno(transover_pheno=transover_pheno, paper_id=paper_id)

    def store_chemical(self, chemical, paper_id):
        self.db_manager.set_chemical(chemical=chemical, paper_id=paper_id)

    def store_env(self, env, paper_id):
        self.db_manager.set_env(env=env, paper_id=paper_id)

    def store_protein(self, protein, paper_id):
            self.db_manager.set_protein(protein=protein, paper_id=paper_id)

    # Disease

    def store_disease(self, disease, paper_id):
        self.db_manager.set_disease(disease=disease, paper_id=paper_id)

    # Comments

    def store_comments(self, comments, paper_id):
        self.db_manager.set_comments(comments=comments, paper_id=paper_id)


class AFPWriter:

    def __init__(self, storage_engine: StorageEngine):
        self.db = storage_engine
        self.logger = logging.getLogger("AFP API")

    def on_post(self, req, resp):
        with self.db:
            paper_id = self.db.get_paper_id_from_passwd(req.media["passwd"])
            if paper_id:
                self.logger.info("paper found")

                # overview
                if "gene_list" in req.media:
                    self.db.store_genes_list(genes=req.media["gene_list"], paper_id=paper_id)
                if "gene_model_update" in req.media:
                    self.db.store_gene_model_update(gene_model_string=req.media["gene_model_update"], paper_id=paper_id)
                if "species_list" in req.media:
                    self.db.store_species_list(species=req.media["species_list"], paper_id=paper_id)

                # genetics
                if "alleles_list" in req.media:
                    self.db.store_alleles_list(alleles=req.media["alleles_list"], paper_id=paper_id)
                if "allele_seq_change" in req.media:
                    self.db.store_allele_seq_change(allele_seq_change=req.media["allele_seq_change"], paper_id=paper_id)
                if "other_alleles" in req.media:
                    self.db.store_other_alleles(other_alleles=req.media["other_alleles"], paper_id=paper_id)
                if "strains_list" in req.media:
                    self.db.store_strains_list(strains=req.media["strains_list"], paper_id=paper_id)
                if "other_strains" in req.media:
                    self.db.store_other_strains(other_strains=req.media["other_strains"], paper_id=paper_id)

                # reagent
                if "transgenes_list" in req.media:
                    self.db.store_transgenes_list(transgenes=req.media["transgenes_list"], paper_id=paper_id)
                if "new_transgenes" in req.media:
                    self.db.store_new_transgenes(new_transgenes=req.media["new_transgenes"], paper_id=paper_id)
                if "new_antibody" in req.media:
                    self.db.store_new_antibody(new_antibody=req.media["new_antibody"], paper_id=paper_id)
                if "other_antibodies" in req.media:
                    self.db.store_other_antibodies(other_antibodies=req.media["other_antibodies"], paper_id=paper_id)

                # expression
                if "anatomic_expr" in req.media:
                    self.db.store_anatomic_expr(anatomic_expr=req.media["anatomic_expr"], paper_id=paper_id)
                if "site_action" in req.media:
                    self.db.store_site_action(site_action=req.media["site_action"], paper_id=paper_id)
                if "time_action" in req.media:
                    self.db.store_time_action(time_action=req.media["time_action"], paper_id=paper_id)
                if "rnaseq" in req.media:
                    self.db.store_rnaseq(rnaseq=req.media["rnaseq"], paper_id=paper_id)
                if "additional_expr" in req.media:
                    self.db.store_additional_expr(additional_expr=req.media["additional_expr"], paper_id=paper_id)

                # interactions
                if "gene_int" in req.media:
                    self.db.store_gene_int(gene_int=req.media["gene_int"], paper_id=paper_id)
                if "phys_int" in req.media:
                    self.db.store_phys_int(phys_int=req.media["phys_int"], paper_id=paper_id)
                if "gene_reg" in req.media:
                    self.db.store_gene_reg(gene_reg=req.media["gene_reg"], paper_id=paper_id)

                # phenotypes
                if "allele_pheno" in req.media:
                    self.db.store_allele_pheno(allele_pheno=req.media["allele_pheno"], paper_id=paper_id)
                if "rnai_pheno" in req.media:
                    self.db.store_rnai_pheno(rnai_pheno=req.media["rnai_pheno"], paper_id=paper_id)
                if "transover_pheno" in req.media:
                    self.db.store_transover_pheno(transover_pheno=req.media["transover_pheno"], paper_id=paper_id)
                if "chemical" in req.media:
                    self.db.store_chemical(chemical=req.media["chemical"], paper_id=paper_id)
                if "env" in req.media:
                    self.db.store_env(env=req.media["env"], paper_id=paper_id)
                if "protein" in req.media:
                    self.db.store_protein(protein=req.media["protein"], paper_id=paper_id)

                # disease
                if "disease" in req.media:
                    self.db.store_disease(disease=req.media["disease"], paper_id=paper_id)

                # comments
                if "comments" in req.media:
                    self.db.store_comments(comments=req.media["comments"], paper_id=paper_id)

            else:
                raise falcon.HTTPError(falcon.HTTP_401)


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str)
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    parser.add_argument("-p", "--port", metavar="port", dest="port", type=int, help="API port")
    args = parser.parse_args()

    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')

    class HandleCORS(object):
        def process_request(self, req, resp):
            allow_headers = req.get_header(
                'Access-Control-Request-Headers',
                default='*'
            )
            resp.set_header('Access-Control-Allow-Origin', '*')
            resp.set_header('Access-Control-Allow-Methods', '*')
            resp.set_header('Access-Control-Allow-Headers', allow_headers)
            resp.set_header('Access-Control-Max-Age', 1728000)  # 20 days
            if req.method == 'OPTIONS':
                raise HTTPStatus(falcon.HTTP_200, body='\n')

    app = falcon.API(middleware=[HandleCORS()])
    db = StorageEngine(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    writer = AFPWriter(storage_engine=db)
    app.add_route('/api/write', writer)

    httpd = simple_server.make_server('0.0.0.0', args.port, app)
    httpd.serve_forever()


if __name__ == '__main__':
    main()
