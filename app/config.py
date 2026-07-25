import os
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
dotenv_path = os.path.join(BASE_DIR, '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

class Config:
    """Central configuration class for noteX AI Flask backend."""
    
    ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')
    PORT = int(os.getenv('PORT', 5000))
    SECRET_KEY = os.getenv('SECRET_KEY', 'notex_secret_key_super_secure_key_2026')
    
    # Database Settings
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/notex_ai')
    MONGO_DB_NAME = 'notex_ai'
    
    # Security & JWT Settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'notex_jwt_secret_key_class1_to_12_learning')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    
    # CORS Settings
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')
    
    # Groq AI Settings
    GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
    MODEL_NAME = os.getenv('MODEL_NAME', 'llama-3.3-70b-versatile')
    AI_PROVIDER = os.getenv('AI_PROVIDER', 'groq')

    # OpenAI & Vector DB Settings
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    EMBEDDING_MODEL = os.getenv('EMBEDDING_MODEL', 'all-MiniLM-L6-v2')
    CHROMA_PERSIST_DIR = os.getenv('CHROMA_PERSIST_DIR', os.path.join(BASE_DIR, 'chroma_db'))
    
    # Upload Settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB Max Upload Limit
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    LOGS_FOLDER = os.path.join(BASE_DIR, 'logs')
    ML_MODELS_FOLDER = os.path.join(BASE_DIR, 'ml_models')
    
    @staticmethod
    def init_app(app):
        """Ensure necessary production directories exist."""
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.CHROMA_PERSIST_DIR, exist_ok=True)
        os.makedirs(Config.LOGS_FOLDER, exist_ok=True)
        os.makedirs(Config.ML_MODELS_FOLDER, exist_ok=True)
