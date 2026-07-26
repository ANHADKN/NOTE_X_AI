from app.config import Config
from pymongo import MongoClient, ASCENDING

def setup_indexes():
    client = MongoClient(Config.MONGO_URI)
    db = client[Config.MONGO_DB_NAME]
    
    print("Setting up MongoDB indexes...")
    
    # Ensure email is unique
    db.users.create_index([("email", ASCENDING)], unique=True)
    
    # Ensure username is unique but allow sparse (nulls okay)
    db.users.create_index([("username", ASCENDING)], unique=True, sparse=True)
    
    # OTPs expire after 10 minutes automatically
    # db.otps.create_index("created_at", expireAfterSeconds=600)
    
    print("Indexes created successfully.")

if __name__ == "__main__":
    setup_indexes()
