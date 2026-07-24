from flask import Blueprint, request
from app.utils.auth import token_required
from app.utils.response import api_response
from app.quiz.services import QuizService
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.utils.logger import logger

quiz_bp = Blueprint('quiz_bp', __name__, url_prefix='/api/quiz')

@quiz_bp.route('/generate', methods=['POST'])
@token_required
def generate_quiz():
    """Generate an AI Quiz (MCQs, 1-Mark, 2-Mark, 5-Mark, HOTS)."""
    try:
        data = request.get_json() or {}
        subject = data.get('subject', 'Science').strip()
        chapter = data.get('chapter', 'Chapter 1').strip()
        num_questions = int(data.get('num_questions', 5))
        quiz_type = data.get('quiz_type', 'mcq')

        user_info = request.user
        student_class = user_info.get('student_class', 'Class 10')

        quiz = QuizService.create_quiz(
            title=f"{subject}: {chapter}",
            subject=subject,
            student_class=student_class,
            num_questions=num_questions,
            quiz_type=quiz_type
        )

        return api_response(success=True, message="AI Quiz generated successfully!", data={"quiz": quiz}, status_code=201)
    except Exception as e:
        logger.error(f"Generate Quiz Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@quiz_bp.route('/list', methods=['GET'])
@token_required
def list_quizzes():
    """List all available quizzes."""
    try:
        user_info = request.user
        student_class = user_info.get('student_class', 'Class 10')
        db = mongo_manager.get_db()

        if db is not None:
            raw = list(db.quizzes.find({"student_class": student_class}).sort("created_at", -1))
            quizzes = BaseModel.serialize_doc(raw)
        else:
            from app.quiz.services import IN_MEMORY_QUIZZES
            quizzes = BaseModel.serialize_doc(list(IN_MEMORY_QUIZZES.values()))

        return api_response(success=True, data={"quizzes": quizzes}, status_code=200)
    except Exception as e:
        logger.error(f"List Quizzes Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@quiz_bp.route('/<quiz_id>', methods=['GET'])
@token_required
def get_quiz(quiz_id):
    """Retrieve single quiz detail."""
    try:
        quiz = QuizService.get_quiz_by_id(quiz_id)
        if not quiz:
            return api_response(success=False, message="Quiz not found.", status_code=404)
        return api_response(success=True, data={"quiz": quiz}, status_code=200)
    except Exception as e:
        logger.error(f"Get Quiz Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@quiz_bp.route('/submit', methods=['POST'])
@token_required
def submit_quiz():
    """Submit student quiz answers for instant AI evaluation."""
    try:
        data = request.get_json() or {}
        quiz_id = data.get('quiz_id')
        student_answers = data.get('answers', {})
        time_taken = int(data.get('time_taken', 60))

        if not quiz_id:
            return api_response(success=False, message="quiz_id is required.", status_code=400)

        user_info = request.user
        user_id = user_info.get('user_id')

        result = QuizService.submit_quiz(
            user_id=user_id,
            quiz_id=quiz_id,
            student_answers=student_answers,
            time_taken=time_taken
        )

        return api_response(success=True, message="Quiz submitted successfully!", data={"result": result}, status_code=200)
    except Exception as e:
        logger.error(f"Submit Quiz Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@quiz_bp.route('/result/<result_id>', methods=['GET'])
@token_required
def get_quiz_result(result_id):
    """Retrieve quiz result details and AI explanations."""
    try:
        db = mongo_manager.get_db()
        from bson import ObjectId
        res = None
        if db is not None:
            try:
                res = db.quiz_results.find_one({"_id": ObjectId(result_id)})
            except Exception:
                res = db.quiz_results.find_one({"id": result_id})
        else:
            from app.quiz.services import IN_MEMORY_RESULTS
            res = IN_MEMORY_RESULTS.get(result_id)

        if not res:
            return api_response(success=False, message="Result not found.", status_code=404)

        return api_response(success=True, data={"result": BaseModel.serialize_doc(res)}, status_code=200)
    except Exception as e:
        logger.error(f"Get Quiz Result Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@quiz_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard():
    """Retrieve global student leaderboard."""
    try:
        leaderboard = QuizService.get_leaderboard()
        return api_response(success=True, data={"leaderboard": leaderboard}, status_code=200)
    except Exception as e:
        logger.error(f"Get Leaderboard Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
