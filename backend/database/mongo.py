import pymongo
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.config import Config
from backend.utils.logger import logger

import time

class MongoManager:
    """Singleton MongoDB Database Connection & Indexing Manager."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoManager, cls).__new__(cls)
            cls._instance.client = None
            cls._instance.db = None
            cls._instance.last_retry = 0
            cls._instance.retry_interval = 30  # Retry every 30 seconds if connection failed
            cls._instance._connect()
        return cls._instance

    def _connect(self):
        self.last_retry = time.time()
        try:
            logger.info(f"Connecting to MongoDB at {Config.MONGO_URI}...")
            self.client = pymongo.MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=1000)
            # Check connection
            self.client.admin.command('ping')
            self.db = self.client[Config.MONGO_DB_NAME]
            logger.info("Successfully connected to MongoDB.")
            self._ensure_indexes()
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            logger.warning(f"MongoDB connection warning: {str(e)}. Application running in fallback mode.")
            self.client = None
            self.db = None

    def _ensure_indexes(self):
        """Build unique and lookup indexes for performance and data integrity."""
        if self.db is not None:
            try:
                # Users index
                self.db.users.create_index("email", unique=True)
                # Chat History index
                self.db.chat_history.create_index([("user_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])
                # Notes index
                self.db.notes.create_index([("user_id", pymongo.ASCENDING), ("student_class", pymongo.ASCENDING)])
                # Documents index
                self.db.documents.create_index("user_id")
                # Quizzes index
                self.db.quizzes.create_index([("user_id", pymongo.ASCENDING), ("subject", pymongo.ASCENDING)])
                logger.info("MongoDB indexes verified successfully.")
            except Exception as e:
                logger.error(f"Error creating MongoDB indexes: {str(e)}")

    def get_db(self):
        """Returns active MongoDB database object or None if offline."""
        if self.db is None:
            # Only retry if retry interval has passed
            if time.time() - self.last_retry > self.retry_interval:
                self._connect()
        return self.db

mongo_manager = MongoManager()
