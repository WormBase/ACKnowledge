import os
import yaml
import logging

from src.backend.definitions import ROOT_DIR


logger = logging.getLogger(__name__)


def load_config_from_file():
    with open(os.path.join(ROOT_DIR, 'config.yml'), 'r') as stream:
        try:
            return yaml.safe_load(stream)
        except yaml.YAMLError as exc:
            logger.error(exc)
            return None
