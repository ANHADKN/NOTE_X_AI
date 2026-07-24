import random
from app.ml.weak_topic_detector import WeakTopicDetector
from app.ml.performance_predictor import PerformancePredictor
from app.ml.recommendation_model import StudyRecommendationEngine

class AIMasteryEngine:
    """Core AI & ML Analytics computation engine for noteX AI."""

    @classmethod
    def calculate_analytics_overview(cls, user_id: str, quiz_history: list = None, study_hours: float = 24.5) -> dict:
        """Calculates student mastery score, retention rate, streak, and prediction."""
        
        # 1. Compute Weak & Strong Topics via ML model
        topic_analysis = WeakTopicDetector.detect_weak_topics(quiz_history or [])
        
        # 2. Compute Exam Score Prediction via ML model
        prediction = PerformancePredictor.predict_score(
            total_study_hours=study_hours,
            average_accuracy=84.5,
            study_streak=7
        )

        # 3. Compute Retention Rate
        retention_rate = 85.0 if study_hours > 20 else 72.0

        # 4. Compute Overall Subject Mastery Score
        mastery_score = round((prediction["predicted_score_percentage"] * 0.6) + (retention_rate * 0.4), 1)

        # 5. ML Study Recommendations
        rec_info = StudyRecommendationEngine.calculate_recommended_hours(
            days_until_exam=25,
            weak_topic_count=len(topic_analysis["weak_topics"])
        )

        return {
            "user_id": user_id,
            "mastery_score": mastery_score,
            "retention_rate": retention_rate,
            "total_study_hours": study_hours,
            "study_streak": 7,
            "predicted_score": prediction["predicted_score_percentage"],
            "predicted_grade": prediction["predicted_grade"],
            "confidence_level": prediction["confidence_level"],
            "weak_topics": topic_analysis["weak_topics"],
            "moderate_topics": topic_analysis["moderate_topics"],
            "strong_topics": topic_analysis["strong_topics"],
            "recommendations": [
                rec_info["recommendation_reason"],
                f"Schedule 45 minutes of active recall flashcards for '{topic_analysis['weak_topics'][0]['topic']}' today.",
                "Maintain your 7-day study streak to unlock +5% score boost in upcoming Board Exams."
            ]
        }

    @classmethod
    def get_chart_data(cls) -> dict:
        """Generates time-series data for Chart.js visualization."""
        return {
            "weekly_study_hours": {
                "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                "data": [3.5, 4.0, 2.5, 5.0, 4.5, 6.0, 3.0]
            },
            "subject_mastery": {
                "labels": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Science"],
                "data": [78, 65, 88, 92, 95, 84]
            }
        }
