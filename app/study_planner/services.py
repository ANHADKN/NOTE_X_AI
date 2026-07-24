import datetime
from bson import ObjectId
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.study_planner.planner import StudyPlanner
from app.utils.logger import logger

IN_MEMORY_PLANS = {}

class StudyPlannerService:
    """Service layer managing Study Planner database operations."""

    @classmethod
    def get_or_create_plan(cls, user_id: str, student_class: str = "Class 10") -> dict:
        """Retrieves active study plan or generates a new personalized schedule."""
        db = mongo_manager.get_db()
        plan = None

        if db is not None:
            plan = db.study_plans.find_one({"user_id": user_id})
        else:
            plan = IN_MEMORY_PLANS.get(user_id)

        if not plan:
            plan = StudyPlanner.generate_personalized_plan(user_id=user_id, student_class=student_class)
            if db is not None:
                db.study_plans.insert_one(plan)
            else:
                IN_MEMORY_PLANS[user_id] = plan

        return BaseModel.serialize_doc(plan)

    @classmethod
    def update_task_completion(cls, user_id: str, task_id: str) -> dict:
        """Marks a task as completed, updates progress and awards +25 XP."""
        db = mongo_manager.get_db()

        if db is not None:
            db.study_plans.update_one(
                {"user_id": user_id, "today_tasks.task_id": task_id},
                {"$set": {"today_tasks.$.is_completed": True}}
            )
            try:
                db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"total_points": 25, "study_streak": 1}})
            except Exception:
                pass
        else:
            plan = IN_MEMORY_PLANS.get(user_id)
            if plan:
                for task in plan.get("today_tasks", []):
                    if task.get("task_id") == task_id:
                        task["is_completed"] = True
                        break

        return {"task_id": task_id, "status": "completed", "points_earned": 25}
