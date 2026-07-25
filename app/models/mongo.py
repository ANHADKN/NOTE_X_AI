import time
import pymongo
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.config import Config
from app.utils.logger import logger

class MongoManager:
    """Singleton MongoDB Database Connection & Indexing Manager."""
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoManager, cls).__new__(cls)
            cls._instance.client = None
            cls._instance.db = None
            cls._instance.last_retry = 0
            cls._instance.retry_interval = 30
            cls._instance._connect()
        return cls._instance

    def _connect(self):
        self.last_retry = time.time()
        try:
            logger.info(f"Connecting to MongoDB at {Config.MONGO_URI}...")
            self.client = pymongo.MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=1000)
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
                self.db.users.create_index("email", unique=True)
                self.db.otps.create_index([("email", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])
                self.db.chat_history.create_index([("user_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])
                self.db.conversations.create_index([("user_id", pymongo.ASCENDING), ("session_id", pymongo.ASCENDING), ("timestamp", pymongo.DESCENDING)])
                self.db.notes.create_index([("user_id", pymongo.ASCENDING), ("student_class", pymongo.ASCENDING)])
                self.db.documents.create_index([("user_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])
                self.db.quizzes.create_index([("user_id", pymongo.ASCENDING), ("subject", pymongo.ASCENDING)])
                self.db.flashcard_decks.create_index([("user_id", pymongo.ASCENDING), ("created_at", pymongo.DESCENDING)])
                self.db.study_plans.create_index("user_id", unique=True)
                self.db.analytics.create_index("user_id", unique=True)
                self.db.activity_logs.create_index([("user_id", pymongo.ASCENDING), ("timestamp", pymongo.DESCENDING)])
                logger.info("MongoDB indexes verified successfully.")
            except Exception as e:
                logger.error(f"Error creating MongoDB indexes: {str(e)}")

    def get_db(self):
        """Returns active MongoDB database object or None if offline."""
        if self.db is None:
            if time.time() - self.last_retry > self.retry_interval:
                self._connect()
        return self.db

mongo_manager = MongoManager()
