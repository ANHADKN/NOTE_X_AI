import datetime
from bson import ObjectId

class QuizModel:
    """MongoDB Schema for AI Generated Quizzes."""

    @staticmethod
    def create_quiz_doc(title: str, subject: str, student_class: str, questions: list, quiz_type: str = "mcq") -> dict:
        return {
            "title": title,
            "subject": subject,
            "student_class": student_class,
            "quiz_type": quiz_type,
            "questions": questions,
            "created_at": datetime.datetime.utcnow().isoformat()
        }

class QuizResultModel:
    """MongoDB Schema for Student Quiz Attempt Results."""

    @staticmethod
    def create_result_doc(user_id: str, quiz_id: str, score: int, total: int, accuracy: float, time_taken: int, answers_breakdown: list) -> dict:
        return {
            "user_id": user_id,
            "quiz_id": quiz_id,
            "score": score,
            "total": total,
            "accuracy": round(accuracy, 1),
            "time_taken": time_taken,  # in seconds
            "answers_breakdown": answers_breakdown,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
