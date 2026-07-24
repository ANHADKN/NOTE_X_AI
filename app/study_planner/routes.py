from flask import Blueprint, request
from app.utils.auth import token_required
from app.utils.response import api_response
from app.study_planner.services import StudyPlannerService
from app.study_planner.planner import StudyPlanner
from app.ml.performance_predictor import PerformancePredictor
from app.utils.logger import logger

study_planner_bp = Blueprint('study_planner_bp', __name__, url_prefix='/api/study-plan')

@study_planner_bp.route('/generate', methods=['POST'])
@token_required
def generate_plan():
    """Generates or regenerates personalized AI study plan."""
    try:
        data = request.get_json() or {}
        subjects = data.get('subjects', ["Mathematics", "Science", "Physics", "Chemistry"])
        exam_date = data.get('exam_date')
        daily_hours = float(data.get('daily_hours', 3.0))

        user_info = request.user
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')

        new_plan = StudyPlanner.generate_personalized_plan(
            user_id=user_id,
            student_class=student_class,
            subjects=subjects,
            exam_date_str=exam_date,
            daily_hours=daily_hours
        )

        return api_response(success=True, message="New AI Study Plan generated!", data={"plan": new_plan}, status_code=201)
    except Exception as e:
        logger.error(f"Generate Plan Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@study_planner_bp.route('/today', methods=['GET'])
@token_required
def get_today_plan():
    """Fetch today's study tasks, streak, and ML score prediction."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')

        plan = StudyPlannerService.get_or_create_plan(user_id, student_class)

        # Predict ML Score
        prediction = PerformancePredictor.predict_score(
            total_study_hours=24.5,
            average_accuracy=84.0,
            study_streak=5
        )

        return api_response(
            success=True,
            data={
                "today_tasks": plan.get("today_tasks", []),
                "recommended_hours": plan.get("recommended_hours", 3.0),
                "recommendation_reason": plan.get("recommendation_reason", ""),
                "days_remaining": plan.get("days_remaining", 30),
                "prediction": prediction
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Get Today Plan Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@study_planner_bp.route('/week', methods=['GET'])
@token_required
def get_weekly_plan():
    """Fetch 7-day weekly timetable."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')

        plan = StudyPlannerService.get_or_create_plan(user_id, student_class)

        return api_response(success=True, data={"weekly_timetable": plan.get("weekly_timetable", [])}, status_code=200)
    except Exception as e:
        logger.error(f"Get Weekly Plan Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@study_planner_bp.route('/month', methods=['GET'])
@token_required
def get_monthly_plan():
    """Fetch monthly exam revision roadmap."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')

        plan = StudyPlannerService.get_or_create_plan(user_id, student_class)

        return api_response(success=True, data={"exam_milestones": plan.get("exam_milestones", [])}, status_code=200)
    except Exception as e:
        logger.error(f"Get Monthly Plan Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@study_planner_bp.route('/complete', methods=['POST'])
@token_required
def complete_task():
    """Mark a daily study task as completed."""
    try:
        data = request.get_json() or {}
        task_id = data.get('task_id')

        if not task_id:
            return api_response(success=False, message="task_id is required.", status_code=400)

        user_info = request.user
        user_id = user_info.get('user_id')

        res = StudyPlannerService.update_task_completion(user_id, task_id)
        return api_response(success=True, message="Task completed (+25 XP)!", data=res, status_code=200)
    except Exception as e:
        logger.error(f"Complete Task Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
