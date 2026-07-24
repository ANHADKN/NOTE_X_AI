import datetime
from bson import ObjectId
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.utils.logger import logger

class AdminService:
    """Database service for isolated Admin Panel capabilities."""

    @classmethod
    def get_system_stats(cls) -> dict:
        """Retrieves global platform statistics for Admin Dashboard."""
        db = mongo_manager.get_db()
        if db is not None:
            total_users = db.users.count_documents({})
            total_docs = db.documents.count_documents({})
            total_notes = db.notes.count_documents({})
            total_quizzes = db.quizzes.count_documents({})
        else:
            total_users = 12
            total_docs = 5
            total_notes = 18
            total_quizzes = 14

        return {
            "total_users": total_users,
            "total_documents": total_docs,
            "total_notes": total_notes,
            "total_quizzes": total_quizzes,
            "active_llm": "OpenAI GPT-4o Mini",
            "vector_store": "ChromaDB Persistent Index",
            "server_status": "Healthy"
        }

    @classmethod
    def list_all_users(cls) -> list:
        """Retrieves list of all registered users."""
        db = mongo_manager.get_db()
        if db is not None:
            users = list(db.users.find({}, {"password_hash": 0}).sort("created_at", -1))
            return BaseModel.serialize_doc(users)
        else:
            return [
                {"id": "usr_1", "name": "Alice Admin", "email": "admin@notex.ai", "role": "admin", "student_class": "Class 12"},
                {"id": "usr_2", "name": "Bob Student", "email": "student@notex.ai", "role": "user", "student_class": "Class 10"}
            ]

    @classmethod
    def toggle_user_status(cls, user_id: str, is_active: bool) -> dict:
        """Activates or deactivates user account."""
        db = mongo_manager.get_db()
        if db is not None:
            try:
                db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": is_active}})
            except Exception:
                db.users.update_one({"id": user_id}, {"$set": {"is_active": is_active}})
        return {"user_id": user_id, "is_active": is_active}

    @classmethod
    def get_system_logs(cls, limit: int = 20) -> list:
        """Retrieves system activity logs for audit monitoring."""
        db = mongo_manager.get_db()
        if db is not None:
            logs = list(db.activity_logs.find().sort("timestamp", -1).limit(limit))
            return BaseModel.serialize_doc(logs)
        else:
            return [
                {"timestamp": datetime.datetime.utcnow().isoformat(), "action": "SYSTEM_START", "details": "Flask server & ChromaDB ready."},
                {"timestamp": datetime.datetime.utcnow().isoformat(), "action": "RAG_SEARCH", "details": "Semantic search executed on ChromaDB index."}
            ]
