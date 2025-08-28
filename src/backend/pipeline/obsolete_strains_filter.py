#!/usr/bin/env python3
"""
Module to fetch and filter obsolete strains from AGR Curation API.

This module provides functionality to:
1. Fetch strains from AGR A-Team API
2. Identify strains marked as obsolete
3. Filter these strains from extraction pipelines
"""

import logging
from typing import Set, Optional, Dict, Any

from agr_curation_api import AGRCurationAPIClient, APIConfig

logger = logging.getLogger(__name__)


class ObsoleteStrainsFilter:
    """Class to manage filtering of obsolete strains from AGR."""
    
    def __init__(self, api_config: Optional[Dict[str, Any]] = None):
        """
        Initialize the Obsolete Strains Filter.
        
        Args:
            api_config: Optional API configuration dictionary
        """
        # Use environment variable or default configuration
        api_config = APIConfig()
        
        try:
            self.client = AGRCurationAPIClient(config=api_config)
            logger.info("Successfully initialized AGR Curation API client")
        except Exception as e:
            logger.error(f"Failed to initialize AGR Curation API client: {e}")
            self.client = None
    
    def fetch_obsolete_strain_names(self, data_provider: str = "WB", limit: int = 10000) -> Set[str]:
        """
        Fetch all obsolete strains from AGR API.
        
        Args:
            data_provider: Data provider abbreviation (default: "WB" for WormBase)
            limit: Maximum number of AGMs to fetch per request
            
        Returns:
            Set of strain names that are marked as obsolete
        """
        obsolete_strain_names = set()
        
        if not self.client:
            logger.warning("AGR API client not initialized, returning empty set")
            return obsolete_strain_names
        
        try:
            logger.info(f"Fetching strains from AGR API for {data_provider}")
            
            # Fetch AGMs with subtype "strain"
            page = 0
            total_fetched = 0
            
            while True:
                try:
                    # Fetch strains from AGR API
                    agms = self.client.get_agms(
                        data_provider=data_provider,
                        subtype="strain",
                        limit=limit,
                        page=page
                    )
                    
                    if not agms:
                        logger.info(f"No more strains found at page {page}")
                        break
                    
                    # Process each AGM to check if it's obsolete
                    for agm in agms:
                        total_fetched += 1
                        
                        if agm.obsolete:
                            if agm.agmFullName:
                                if agm.agmFullName.displayText:
                                    obsolete_strain_names.add(agm.agmFullName.displayText)
                                    logger.debug(f"Found obsolete strain: {agm.agmFullName.displayText}")
                                else:
                                    logger.warning(f"Obsolete strain with missing displayText: {agm}")
                            else:
                                logger.warning(f"Obsolete strain with missing agmFullName: {agm}")
                    
                    logger.info(f"Processed page {page}, total strains fetched: {total_fetched}, "
                                f"obsolete strains found: {len(obsolete_strain_names)}")
                    
                    # If we got less than the limit, we've reached the end
                    if len(agms) < limit:
                        break
                    
                    page += 1
                    
                except Exception as e:
                    logger.error(f"Error fetching strains at page {page}: {e}")
                    break
            
            logger.info(f"Total obsolete strains found: {len(obsolete_strain_names)}")
            
        except Exception as e:
            logger.error(f"Error fetching obsolete strains from AGR API: {e}")
        
        return obsolete_strain_names


if __name__ == "__main__":
    # Test the module
    logging.basicConfig(level=logging.INFO)
    
    filter = ObsoleteStrainsFilter()
    obsolete_strains = filter.fetch_obsolete_strain_names()
    
    print(f"Found {len(obsolete_strains)} obsolete strains")
    if obsolete_strains:
        print("Sample obsolete strains:", list(obsolete_strains)[:10])
