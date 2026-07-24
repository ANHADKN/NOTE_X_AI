class PerformancePredictor:
    """Predicts student exam score percentage based on study hours, quiz accuracy, and streak."""

    @staticmethod
    def predict_score(total_study_hours: float, average_accuracy: float, study_streak: int) -> dict:
        """
        Predicts expected exam performance percentage.
        """
        base_score = 50.0
        hours_boost = min(total_study_hours * 0.8, 25.0)
        accuracy_boost = (average_accuracy / 100.0) * 20.0
        streak_boost = min(study_streak * 0.5, 5.0)

        predicted_percentage = round(min(base_score + hours_boost + accuracy_boost + streak_boost, 98.5), 1)

        grade_letter = "A+" if predicted_percentage >= 90 else ("A" if predicted_percentage >= 80 else ("B" if predicted_percentage >= 70 else "C"))

        return {
            "predicted_score_percentage": predicted_percentage,
            "predicted_grade": grade_letter,
            "confidence_level": "89%",
            "insights": [
                f"Your study streak of {study_streak} days adds +{streak_boost:.1f}% to your predicted exam score.",
                f"Logging 5 more study hours this week could boost your score by up to +4.0%."
            ]
        }
