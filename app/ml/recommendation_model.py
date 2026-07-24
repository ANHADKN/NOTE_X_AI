import math

class StudyRecommendationEngine:
    """ML Recommendation Engine for optimal daily study hours & subject time distribution."""

    @staticmethod
    def calculate_recommended_hours(days_until_exam: int, weak_topic_count: int, target_exam: str = "Board Exam") -> dict:
        """
        Calculates recommended daily study hours and time allocation weights.
        """
        base_hours = 3.0
        if days_until_exam < 14:
            base_hours += 2.5
        elif days_until_exam < 30:
            base_hours += 1.5

        if weak_topic_count > 3:
            base_hours += 1.0

        recommended_hours = round(min(base_hours, 8.0), 1)

        weak_weight = 0.50
        revision_weight = 0.30
        practice_weight = 0.20

        return {
            "recommended_daily_hours": recommended_hours,
            "allocation_weights": {
                "weak_subjects": f"{int(weak_weight * 100)}%",
                "exam_revision": f"{int(revision_weight * 100)}%",
                "practice_quizzes": f"{int(practice_weight * 100)}%"
            },
            "recommendation_reason": (
                f"With {days_until_exam} days remaining until {target_exam} and {weak_topic_count} high-priority topics identified, "
                f"we recommend spending {recommended_hours} hours daily with 50% dedicated to weak topics."
            )
        }
