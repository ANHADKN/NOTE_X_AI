import datetime
from bson import ObjectId
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.quiz.models import QuizModel, QuizResultModel
from app.quiz.ai_quiz import AIQuizGenerator
from app.quiz.evaluator import QuizEvaluator
from app.utils.logger import logger

IN_MEMORY_QUIZZES = {}
IN_MEMORY_RESULTS = {}

class QuizService:
    """Database service managing 'quizzes' and 'quiz_results' MongoDB collections."""

    @classmethod
    def create_quiz(cls, title: str, subject: str, student_class: str, num_questions: int = 5, quiz_type: str = "mcq") -> dict:
        questions = AIQuizGenerator.generate_quiz_questions(
            subject=subject,
            chapter=title,
            num_questions=num_questions,
            question_type=quiz_type,
            student_class=student_class
        )

        quiz_doc = QuizModel.create_quiz_doc(
            title=title,
            subject=subject,
            student_class=student_class,
            questions=questions,
            quiz_type=quiz_type
        )

        db = mongo_manager.get_db()
        if db is not None:
            res = db.quizzes.insert_one(quiz_doc)
            quiz_id = str(res.inserted_id)
            quiz_doc['id'] = quiz_id
        else:
            quiz_id = f"quiz_{len(IN_MEMORY_QUIZZES) + 1}"
            quiz_doc['id'] = quiz_id
            IN_MEMORY_QUIZZES[quiz_id] = quiz_doc

        return BaseModel.serialize_doc(quiz_doc)

    @classmethod
    def get_quiz_by_id(cls, quiz_id: str) -> dict:
        db = mongo_manager.get_db()
        quiz = None
        if db is not None:
            try:
                quiz = db.quizzes.find_one({"_id": ObjectId(quiz_id)})
            except Exception:
                quiz = db.quizzes.find_one({"id": quiz_id})
        else:
            quiz = IN_MEMORY_QUIZZES.get(quiz_id)

        return BaseModel.serialize_doc(quiz)

    @classmethod
    def submit_quiz(cls, user_id: str, quiz_id: str, student_answers: dict, time_taken: int) -> dict:
        quiz = cls.get_quiz_by_id(quiz_id)
        if not quiz:
            raise ValueError("Quiz not found.")

        evaluation = QuizEvaluator.evaluate_submission(quiz.get('questions', []), student_answers, time_taken)

        result_doc = QuizResultModel.create_result_doc(
            user_id=user_id,
            quiz_id=quiz_id,
            score=evaluation["score"],
            total=evaluation["total"],
            accuracy=evaluation["accuracy"],
            time_taken=time_taken,
            answers_breakdown=evaluation["answers_breakdown"]
        )

        db = mongo_manager.get_db()
        if db is not None:
            res = db.quiz_results.insert_one(result_doc)
            result_id = str(res.inserted_id)
            result_doc['id'] = result_id
            # Reward XP points
            try:
                db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"total_points": evaluation["score"] * 10}})
            except Exception:
                pass
        else:
            result_id = f"res_{len(IN_MEMORY_RESULTS) + 1}"
            result_doc['id'] = result_id
            IN_MEMORY_RESULTS[result_id] = result_doc

        return BaseModel.serialize_doc(result_doc)

    @classmethod
    def get_leaderboard(cls, limit: int = 10) -> list:
        db = mongo_manager.get_db()
        if db is not None:
            users = list(db.users.find({}, {"name": 1, "student_class": 1, "total_points": 1, "study_streak": 1}).sort("total_points", -1).limit(limit))
            return BaseModel.serialize_doc(users)
        else:
            return [
                {"name": "Alex Smith", "student_class": "Class 10", "total_points": 580, "study_streak": 8},
                {"name": "Sarah Connor", "student_class": "Class 10", "total_points": 520, "study_streak": 7},
                {"name": "David Miller", "student_class": "Class 10", "total_points": 490, "study_streak": 5}
            ]
