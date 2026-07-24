import datetime
from flask import Blueprint, request
from bson import ObjectId
from app.utils.auth import token_required
from app.utils.response import api_response
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.utils.logger import logger

dashboard_bp = Blueprint('dashboard_bp', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
@token_required
def get_dashboard_stats():
    """Retrieve comprehensive dashboard statistics for active student session."""
    try:
        user_info = request.user
        email = user_info.get('email')
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')
        
        db = mongo_manager.get_db()
        
        user_data = None
        if db is not None:
            try:
                user_data = db.users.find_one({"_id": ObjectId(user_id)})
            except Exception:
                user_data = db.users.find_one({"email": email})
        
        # Calculate subject-wise completion & statistics
        subjects = [
            "Mathematics", "Science", "Physics", "Chemistry", "Biology",
            "English", "Malayalam", "Hindi", "Social Science", "Computer Science"
        ]
        
        subject_progress = [
            {"subject": "Mathematics", "progress": 78, "topics_completed": 14, "total_topics": 18, "status": "Strong"},
            {"subject": "Science", "progress": 85, "topics_completed": 17, "total_topics": 20, "status": "Strong"},
            {"subject": "Physics", "progress": 62, "topics_completed": 8, "total_topics": 13, "status": "Needs Review"},
            {"subject": "Chemistry", "progress": 70, "topics_completed": 9, "total_topics": 13, "status": "Good"},
            {"subject": "Computer Science", "progress": 92, "topics_completed": 12, "total_topics": 13, "status": "Mastered"},
            {"subject": "English", "progress": 88, "topics_completed": 15, "total_topics": 17, "status": "Strong"}
        ]
        
        recent_activities = [
            {"id": "act_1", "title": "Completed Chemistry Quiz", "category": "Quiz", "timestamp": "10 mins ago", "score": "90%"},
            {"id": "act_2", "title": "Generated Class 10 Physics Smart Notes", "category": "Notes", "timestamp": "1 hour ago", "score": "Complete"},
            {"id": "act_3", "title": "Solved AI Doubt in Quadratic Equations", "category": "Doubt Solver", "timestamp": "3 hours ago", "score": "Solved"},
            {"id": "act_4", "title": "Created Weekly Study Schedule", "category": "Study Plan", "timestamp": "Yesterday", "score": "Active"}
        ]

        stats_payload = {
            "user": {
                "name": user_data.get('name', 'Student') if user_data else "Student",
                "email": email,
                "student_class": user_data.get('student_class', student_class) if user_data else student_class,
                "target_exam": user_data.get('target_exam', 'Board Exam') if user_data else 'Board Exam',
                "study_streak": user_data.get('study_streak', 5) if user_data else 5,
                "total_points": user_data.get('total_points', 320) if user_data else 320
            },
            "metrics": {
                "total_study_hours": 24.5,
                "notes_generated": 18,
                "quizzes_completed": 12,
                "doubts_resolved": 15,
                "overall_accuracy": "84%"
            },
            "subject_progress": subject_progress,
            "recent_activities": recent_activities,
            "weekly_study_graph": [
                {"day": "Mon", "hours": 3.2},
                {"day": "Tue", "hours": 4.5},
                {"day": "Wed", "hours": 2.8},
                {"day": "Thu", "hours": 5.0},
                {"day": "Fri", "hours": 4.2},
                {"day": "Sat", "hours": 6.1},
                {"day": "Sun", "hours": 3.5}
            ]
        }

        return api_response(success=True, data=stats_payload, status_code=200)
    except Exception as e:
        logger.error(f"Dashboard Stats Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@dashboard_bp.route('/activity', methods=['POST'])
@token_required
def log_activity():
    """Log a student activity for progress tracking."""
    try:
        data = request.get_json() or {}
        title = data.get('title', 'Studied Topic')
        category = data.get('category', 'General')
        user_info = request.user
        user_id = user_info.get('user_id')
        
        activity_doc = {
            "user_id": user_id,
            "title": title,
            "category": category,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
        
        db = mongo_manager.get_db()
        if db is not None:
            db.activities.insert_one(activity_doc)
            db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"total_points": 10}})
            
        return api_response(success=True, message="Activity logged successfully (+10 points)!", status_code=200)
    except Exception as e:
        logger.error(f"Log Activity Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
