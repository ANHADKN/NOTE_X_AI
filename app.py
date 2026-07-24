import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.config import Config
from app.utils.logger import logger

app = create_app()

if __name__ == '__main__':
    logger.info(f"Starting noteX AI Application Server on port {Config.PORT}...")
    app.run(host='0.0.0.0', port=Config.PORT, debug=Config.DEBUG)
