import datetime
from bson import ObjectId

class AnalyticsModel:
    """MongoDB Schema for Student AI Analytics."""

    @staticmethod
    def create_analytics_doc(
        user_id: str,
        mastery_score: float = 82.5,
        retention_rate: float = 78.0,
        study_time_mins: int = 1420,
        weak_topics: list = None,
        strong_topics: list = None,
        predicted_score: float = 88.5
    ) -> dict:
        return {
            "user_id": user_id,
            "mastery_score": round(mastery_score, 1),
            "retention_rate": round(retention_rate, 1),
            "study_time_mins": study_time_mins,
            "weak_topics": weak_topics or [],
            "strong_topics": strong_topics or [],
            "predicted_score": round(predicted_score, 1),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }

class ActivityLogModel:
    """MongoDB Schema for Student Activity Logs."""

    @staticmethod
    def create_log_doc(user_id: str, action: str, details: str = "") -> dict:
        return {
            "user_id": user_id,
            "action": action,
            "details": details,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
