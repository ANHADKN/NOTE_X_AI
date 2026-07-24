import os
import logging
from logging.handlers import RotatingFileHandler

def setup_logger(app=None):
    """Sets up unified logging for noteX AI backend."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    log_dir = os.path.join(base_dir, 'logs')
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, 'notex_ai.log')

    formatter = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] [%(filename)s:%(lineno)d] - %(message)s'
    )

    file_handler = RotatingFileHandler(log_file, maxBytes=5 * 1024 * 1024, backupCount=3)
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.INFO)

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(logging.INFO)

    logger = logging.getLogger('noteX_AI')
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(stream_handler)

    if app:
        app.logger.addHandler(file_handler)
        app.logger.addHandler(stream_handler)
        app.logger.setLevel(logging.INFO)

    return logger

logger = setup_logger()
