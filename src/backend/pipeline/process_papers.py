#!/usr/bin/env python3

import argparse
import time
from datetime import datetime, timedelta

from wbtools.db.dbmanager import WBDBManager
from wbtools.lib.nlp.common import EntityType
from wbtools.lib.nlp.entity_extraction.ntt_extractor import NttExtractor
from wbtools.lib.nlp.literature_index.textpresso import TextpressoLiteratureIndex
from wbtools.literature.corpus import CorpusManager

from src.backend.common.config import load_config_from_file
from src.backend.common.emailtools import *
from src.backend.pipeline.obsolete_strains_filter import ObsoleteStrainsFilter

logger = logging.getLogger(__name__)


def retry_with_backoff(func, max_retries=3, base_delay=1, backoff_factor=2, *args, **kwargs):
    """
    Retry a function with exponential backoff in case of errors.
    
    Args:
        func: Function to retry
        max_retries: Maximum number of retry attempts (default: 3)
        base_delay: Initial delay in seconds (default: 1)
        backoff_factor: Multiplier for delay after each retry (default: 2)
        *args, **kwargs: Arguments to pass to the function
    
    Returns:
        Result of the function call
    
    Raises:
        The last exception raised after all retries are exhausted
    """
    last_exception = None
    
    for attempt in range(max_retries + 1):  # +1 for the initial attempt
        try:
            return func(*args, **kwargs)
        except Exception as e:
            last_exception = e
            if attempt < max_retries:
                delay = base_delay * (backoff_factor ** attempt)
                logger.warning(f"Attempt {attempt + 1} failed: {str(e)}. Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                logger.error(f"All {max_retries + 1} attempts failed. Last error: {str(e)}")
    
    raise last_exception


def extract_meaningful_entities_with_retry(ntt_extractor, **kwargs):
    """
    Wrapper for extract_meaningful_entities_by_keywords with retry logic for Textpresso failures.
    """
    return retry_with_backoff(
        ntt_extractor.extract_meaningful_entities_by_keywords,
        max_retries=5,
        base_delay=2,
        backoff_factor=2,
        **kwargs
    )


def main():
    parser = argparse.ArgumentParser(description="Find new documents in WormBase collection and pre-populate data "
                                                 "structures for Author First Pass")
    parser.add_argument("-N", "--db-name", metavar="db_name", dest="db_name", type=str)
    parser.add_argument("-U", "--db-user", metavar="db_user", dest="db_user", type=str)
    parser.add_argument("-P", "--db-password", metavar="db_password", dest="db_password", type=str, default="")
    parser.add_argument("-H", "--db-host", metavar="db_host", dest="db_host", type=str)
    parser.add_argument("-p", "--email-password", metavar="email_passwd", dest="email_passwd", type=str)
    parser.add_argument("-l", "--log-file", metavar="log_file", dest="log_file", type=str, default=None,
                        help="path to the log file to generate. Default ./afp_pipeline.log")
    parser.add_argument("-L", "--log-level", dest="log_level", choices=['DEBUG', 'INFO', 'WARNING', 'ERROR',
                                                                        'CRITICAL'], default="INFO",
                        help="set the logging level")
    parser.add_argument("-n", "--num-papers", metavar="num_papers", dest="num_papers", type=int, default=10,
                        help="number of papers to process per run")
    parser.add_argument("-a", "--admin-emails", metavar="admin_emails", dest="admin_emails", type=str, nargs="+",
                        help="list of email addresses of administrators that will receive summary emails with pipeline "
                             "reports at each iterations")
    parser.add_argument("-u", "--afp-base-url", metavar="afp_base_url", dest="afp_base_url", type=str)
    parser.add_argument("-t", "--textpresso-token", metavar="textpresso_token", dest="textpresso_token", type=str,
                        help="API token for Textpresso literature index")
    parser.add_argument("-d", "--dev-mode", dest="dev_mode", action="store_true")
    parser.add_argument("-s", "--stats", dest="print_stats", action="store_true")
    parser.add_argument("-i", "--paper-ids", metavar="paper_ids", dest="paper_ids", type=str, nargs="+",
                        help="process the provided list of papers instead of reading them from db")
    args = parser.parse_args()
    logging.basicConfig(filename=args.log_file, level=args.log_level,
                        format='%(asctime)s - %(name)s - %(levelname)s:%(message)s')
    config = load_config_from_file()
    email_manager = EmailManager(config=config, email_passwd=args.email_passwd)

    db_manager = WBDBManager(dbname=args.db_name, user=args.db_user, password=args.db_password, host=args.db_host)
    ntt_extractor = NttExtractor(db_manager=db_manager.generic)
    textpresso_lit_index = TextpressoLiteratureIndex(
        api_url="https://wb-textpresso.alliancegenome.org/v1/textpresso/api/", api_token=args.textpresso_token,
        use_cache=True, corpora=["C. elegans"])
    cm = CorpusManager()
    if args.paper_ids:
        cm.load_from_wb_database(
            args.db_name, args.db_user, args.db_password, args.db_host,
            must_be_autclass_flagged=True, exclude_no_main_text=True,
            exclude_no_author_email=True, exclude_temp_pdf=True, paper_ids=args.paper_ids)
    else:
        cm.load_from_wb_database(
            args.db_name, args.db_user, args.db_password, args.db_host,
            from_date=(datetime.now() - timedelta(days=2*365))
                .strftime("%m-%d-%Y"), max_num_papers=args.num_papers, must_be_autclass_flagged=True,
            exclude_afp_processed=True, exclude_afp_not_curatable=True, exclude_no_main_text=True,
            exclude_no_author_email=True, exclude_temp_pdf=True)
    logging.info("getting lists of entities")
    curated_genes = db_manager.generic.get_curated_genes(exclude_id_used_as_name=False, include_seqname=True,
                                                         include_synonyms=False)
    gene_name_id_map = db_manager.generic.get_gene_name_id_map()
    curated_alleles = ntt_extractor.get_curated_entities(EntityType.VARIATION, exclude_id_used_as_name=False)
    allele_name_id_map = db_manager.generic.get_variation_name_id_map()
    curated_strains = ntt_extractor.get_curated_entities(EntityType.STRAIN, exclude_id_used_as_name=False)
    strain_name_id_map = db_manager.generic.get_strain_name_id_map()
    
    # Filter out obsolete strains from AGR API
    logger.info("Filtering obsolete strains from AGR API")
    obsolete_strains_filter = ObsoleteStrainsFilter()
    curated_strains = list(set(curated_strains) - set(
        obsolete_strains_filter.fetch_obsolete_strain_names(data_provider="WB")))
    curated_transgenes = ntt_extractor.get_curated_entities(EntityType.TRANSGENE, exclude_id_used_as_name=False)
    transgene_name_id_map = db_manager.generic.get_transgene_name_id_map()
    taxon_id_species_name = db_manager.generic.get_taxon_id_names_map()
    tinyurls = []
    emailed_papers = []
    blacklisted_email_addresses = db_manager.generic.get_blacklisted_email_addresses()
    for paper in cm.get_all_papers():
        logging.info("processing paper " + str(paper.paper_id))
        fulltext = paper.get_text_docs(include_supplemental=True, tokenize=False, return_concatenated=True)
        fulltext = fulltext.replace('\n', ' ')
        paper.abstract = paper.abstract if paper.abstract else ""
        paper.title = paper.title if paper.title else ""
        title_abs = paper.title + " " + paper.abstract

        logger.info("Getting list of genes")

        meaningful_genes_fulltext = extract_meaningful_entities_with_retry(
            ntt_extractor,
            keywords=curated_genes,
            text=fulltext,
            lit_index=textpresso_lit_index,
            match_uppercase=True,
            min_matches=config["ntt_extraction"]["min_occurrences"]["gene"],
            blacklist=config["ntt_extraction"]["exclusion_list"]["gene"],
            tfidf_threshold=config["ntt_extraction"]["min_tfidf"]["gene"])

        meaningful_genes_title_abstract = ntt_extractor.extract_meaningful_entities_by_keywords(
            keywords=curated_genes,
            text=title_abs,
            blacklist=config["ntt_extraction"]["exclusion_list"]["gene"],
            match_uppercase=True)

        meaningful_genes = list(set(meaningful_genes_fulltext) | set(meaningful_genes_title_abstract))

        logger.info("Getting list of alleles")

        meaningful_alleles_fulltext = extract_meaningful_entities_with_retry(
            ntt_extractor,
            keywords=curated_alleles, text=fulltext,
            lit_index=textpresso_lit_index,
            min_matches=config["ntt_extraction"]["min_occurrences"]["allele"],
            blacklist=config["ntt_extraction"]["exclusion_list"]["allele"],
            tfidf_threshold=config["ntt_extraction"]["min_tfidf"]["allele"])

        meaningful_alleles_title_abstract = ntt_extractor.extract_meaningful_entities_by_keywords(
            keywords=curated_alleles, text=title_abs,
            blacklist=config["ntt_extraction"]["exclusion_list"]["allele"])

        meaningful_alleles = list(set(meaningful_alleles_fulltext) | set(meaningful_alleles_title_abstract))

        logger.info("Getting list of strains")

        meaningful_strains_fulltext = extract_meaningful_entities_with_retry(
            ntt_extractor,
            keywords=curated_strains, text=fulltext,
            lit_index=textpresso_lit_index,
            min_matches=config["ntt_extraction"]["min_occurrences"]["strain"],
            blacklist=config["ntt_extraction"]["exclusion_list"]["strain"],
            tfidf_threshold=config["ntt_extraction"]["min_tfidf"]["strain"])

        meaningful_strains_title_abstract = ntt_extractor.extract_meaningful_entities_by_keywords(
            keywords=curated_strains, text=title_abs,
            blacklist=config["ntt_extraction"]["exclusion_list"]["strain"])

        meaningful_strains = list(set(meaningful_strains_fulltext) | set(meaningful_strains_title_abstract))

        logger.info("Getting list of transgenes")

        meaningful_transgenes_fulltext = extract_meaningful_entities_with_retry(
            ntt_extractor,
            keywords=curated_transgenes, text=fulltext,
            lit_index=textpresso_lit_index,
            min_matches=config["ntt_extraction"]["min_occurrences"]["transgene"],
            blacklist=config["ntt_extraction"]["exclusion_list"]["transgene"],
            tfidf_threshold=config["ntt_extraction"]["min_tfidf"]["transgene"])

        meaningful_transgenes_title_abstract = ntt_extractor.extract_meaningful_entities_by_keywords(
            keywords=curated_transgenes, text=title_abs,
            blacklist=config["ntt_extraction"]["exclusion_list"]["transgene"])

        meaningful_transgenes = list(set(meaningful_transgenes_fulltext) | set(meaningful_transgenes_title_abstract))

        logger.info("Getting list of species through string matching")

        meaningful_species_fulltext = ntt_extractor.extract_species_regex(
            text=fulltext,
            taxon_id_name_map=taxon_id_species_name,
            min_matches=config["ntt_extraction"]["min_occurrences"]["species"],
            blacklist=config["ntt_extraction"]["exclusion_list"]["species"],
            whitelist=config["ntt_extraction"]["inclusion_list"]["species"],
            tfidf_threshold=config["ntt_extraction"]["min_tfidf"]["species"])

        meaningful_species_title_abstract = ntt_extractor.extract_species_regex(
            text=title_abs,
            taxon_id_name_map=taxon_id_species_name,
            blacklist=config["ntt_extraction"]["exclusion_list"]["species"],
            whitelist=config["ntt_extraction"]["inclusion_list"]["species"])

        meaningful_species = list(set(meaningful_species_fulltext) | set(meaningful_species_title_abstract))

        logger.info("Transforming keywords into ids")

        genes_id_name = [ntt_id.replace("WBGene", "") + ";%;" + ntt_name for ntt_id, ntt_name in ntt_extractor.get_entity_ids_from_names(
            meaningful_genes, gene_name_id_map)]
        logger.info("Transforming allele keywords into allele ids")
        alleles_id_name = [ntt_id + ";%;" + ntt_name for ntt_id, ntt_name in ntt_extractor.get_entity_ids_from_names(
            meaningful_alleles, allele_name_id_map)]
        logger.info("Transforming transgene keywords into transgene ids")
        transgenes_id_name = [ntt_id + ";%;" + ntt_name for ntt_id, ntt_name in ntt_extractor.get_entity_ids_from_names(
            meaningful_transgenes, transgene_name_id_map)]
        strains_id_name = [ntt_id + ";%;" + ntt_name for ntt_id, ntt_name in ntt_extractor.get_entity_ids_from_names(
            meaningful_strains, strain_name_id_map)]
        authors = paper.get_authors_with_email_address_in_wb(blacklisted_email_addresses=blacklisted_email_addresses,
                                                             first_only=False)
        with db_manager:
            passwd = db_manager.afp.save_extracted_data_to_db(
                paper_id=paper.paper_id, genes=genes_id_name, alleles=alleles_id_name, species=meaningful_species,
                strains=strains_id_name, transgenes=transgenes_id_name,
                author_emails=[author[1] for author in authors])

        if authors:
            feedback_form_tiny_url = EmailManager.get_feedback_form_tiny_url(
                afp_base_url=args.afp_base_url, paper_id=paper.paper_id, passwd=passwd, genes=genes_id_name,
                alleles=alleles_id_name, strains=strains_id_name, title=paper.title, journal=paper.journal,
                pmid=paper.pmid, corresponding_author_id=authors[0][0].person_id, doi=paper.doi)
            tinyurls.append(feedback_form_tiny_url)
            emailed_papers.append(paper.paper_id)

            if genes_id_name or alleles_id_name or transgenes_id_name or meaningful_strains:
                # Get list of all author emails for coauthor coordination
                all_author_emails = [author[1] for author in authors]
                
                for author in authors:
                    # Get coauthor emails (all authors except current recipient)
                    coauthor_emails = [email for email in all_author_emails if email != author[1]]
                    
                    author_specific_form_link = EmailManager.get_feedback_form_tiny_url(
                        afp_base_url=args.afp_base_url, paper_id=paper.paper_id, passwd=passwd, genes=genes_id_name,
                        alleles=alleles_id_name, strains=strains_id_name, title=paper.title, journal=paper.journal,
                        pmid=paper.pmid, corresponding_author_id=author[0].person_id, doi=paper.doi)
                    logger.info(
                        f"Sending email to {author[1]} (person_id: {author[0].person_id}) "
                        f"for paper {paper.paper_id}: {author_specific_form_link}"
                    )
                    if not args.dev_mode:
                        email_manager.send_email_to_author(
                            paper.paper_id, paper.title, paper.journal, author_specific_form_link, [author[1]], coauthor_emails)
                if args.dev_mode:
                    email_manager.send_email_to_author(paper.paper_id, paper.title, paper.journal,
                                                       feedback_form_tiny_url, args.admin_emails, [])
            else:
                email_manager.notify_admin_of_paper_without_entities(paper.paper_id, paper.title,
                                                                     paper.journal, feedback_form_tiny_url,
                                                                     args.admin_emails)
    email_manager.send_summary_email_to_admin(urls=tinyurls, paper_ids=emailed_papers, recipients=args.admin_emails)
    logger.info("Pipeline finished successfully")


if __name__ == '__main__':
    main()
