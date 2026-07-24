import datetime
from bson import ObjectId
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.analytics.models import AnalyticsModel, ActivityLogModel
from app.ml.mastery_engine import AIMasteryEngine
from app.utils.logger import logger

IN_MEMORY_ANALYTICS = {}
IN_MEMORY_LOGS = []

class AnalyticsService:
    """Database service managing 'analytics' and 'activity_logs' MongoDB collections."""

    @classmethod
    def get_user_analytics(cls, user_id: str) -> dict:
        """Retrieves or calculates real-time AI Analytics for student."""
        db = mongo_manager.get_db()
        data = AIMasteryEngine.calculate_analytics_overview(user_id)

        if db is not None:
            doc = AnalyticsModel.create_analytics_doc(
                user_id=user_id,
                mastery_score=data["mastery_score"],
                retention_rate=data["retention_rate"],
                study_time_mins=int(data["total_study_hours"] * 60),
                weak_topics=data["weak_topics"],
                strong_topics=data["strong_topics"],
                predicted_score=data["predicted_score"]
            )
            db.analytics.update_one({"user_id": user_id}, {"$set": doc}, upsert=True)
        else:
            IN_MEMORY_ANALYTICS[user_id] = data

        return data

    @classmethod
    def log_activity(cls, user_id: str, action: str, details: str = "") -> dict:
        """Logs student action for AI behavior tracking."""
        log_doc = ActivityLogModel.create_log_doc(user_id, action, details)
        db = mongo_manager.get_db()

        if db is not None:
            db.activity_logs.insert_one(log_doc)
        else:
            IN_MEMORY_LOGS.append(log_doc)

        return BaseModel.serialize_doc(log_doc)
