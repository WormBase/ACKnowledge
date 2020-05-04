import os
import yaml
import logging


logger = logging.getLogger(__name__)


def load_config_from_file():
    with open(os.path.join(os.getcwd(), "src/backend/config.yml"), 'r') as stream:
        try:
            return yaml.safe_load(stream)
        except yaml.YAMLError as exc:
            logger.error(exc)
            return None
