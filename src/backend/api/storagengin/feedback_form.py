import logging

from src.backend.api.storagengin.afp_storage_engine import AFPStorageBaseEngine


logger = logging.getLogger(__name__)


class FeedbackFormStorageEngine(AFPStorageBaseEngine):

    def __init__(self, dbname, user, password, host, tazendra_user, tazendra_password):
        super().__init__(dbname, user, password, host, tazendra_user, tazendra_password)

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

    def store_comments(self, comments, paper_id, person_id):
        self.db_manager.set_comments(comments=comments, paper_id=paper_id)
        self.db_manager.set_pap_gene_list(paper_id=paper_id, person_id=person_id)
        self.db_manager.set_pap_species_list(paper_id=paper_id, person_id=person_id)
        self.db_manager.set_contributor(paper_id=paper_id, person_id=person_id)
        self.db_manager.set_version(paper_id=paper_id)
        self.db_manager.set_last_touched(paper_id=paper_id)

