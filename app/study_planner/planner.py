import datetime
from app.ml.weak_topic_detector import WeakTopicDetector
from app.ml.recommendation_model import StudyRecommendationEngine

class StudyPlanner:
    """AI Study Planner & Schedule Generator."""

    @classmethod
    def generate_personalized_plan(
        cls,
        user_id: str,
        student_class: str = "Class 10",
        subjects: list = None,
        exam_date_str: str = None,
        daily_hours: float = 3.0,
        weak_topics: list = None
    ) -> dict:
        """
        Generates Daily, Weekly, Monthly, and Exam Revision Schedules.
        """
        if not subjects:
            subjects = ["Mathematics", "Science", "Physics", "Chemistry", "English"]

        # Parse Exam Date
        exam_date = datetime.datetime.now() + datetime.timedelta(days=30)
        if exam_date_str:
            try:
                exam_date = datetime.datetime.strptime(exam_date_str, "%Y-%m-%d")
            except Exception:
                pass

        days_remaining = max((exam_date - datetime.datetime.now()).days, 1)

        # ML Weak Topic Detection
        weak_analysis = WeakTopicDetector.detect_weak_topics(weak_topics or [])
        weak_list = weak_analysis["weak_topics"]

        # ML Recommendation Engine
        rec_info = StudyRecommendationEngine.calculate_recommended_hours(
            days_until_exam=days_remaining,
            weak_topic_count=len(weak_list)
        )

        # 1. Generate Today's Tasks
        today_tasks = []
        for i, sub in enumerate(subjects[:3]):
            topic_name = weak_list[i]['topic'] if i < len(weak_list) else f"Chapter {i+1} Revision"
            today_tasks.append({
                "task_id": f"task_today_{i+1}",
                "subject": sub,
                "topic": topic_name,
                "allocated_minutes": int((daily_hours * 60) / 3),
                "is_completed": False,
                "is_weak_topic": i < len(weak_list)
            })

        # 2. Generate Weekly Timetable (7 Days)
        weekly_timetable = []
        days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for day in days_of_week:
            sub1 = subjects[len(weekly_timetable) % len(subjects)]
            sub2 = subjects[(len(weekly_timetable) + 1) % len(subjects)]
            weekly_timetable.append({
                "day": day,
                "slots": [
                    {"time": "05:30 PM - 07:00 PM", "subject": sub1, "activity": "Deep Study & Smart Notes"},
                    {"time": "07:30 PM - 09:00 PM", "subject": sub2, "activity": "Practice Quiz & AI Doubt Solver"}
                ]
            })

        # 3. Exam Milestone Roadmap
        exam_milestones = [
            {"milestone": "Phase 1: Concept Mastery & Weak Topics", "timeframe": "Next 10 Days"},
            {"milestone": "Phase 2: Chapter Quizzes & Formula Memorization", "timeframe": "11-20 Days"},
            {"milestone": "Phase 3: Full Mock Exams & Final Revision", "timeframe": "Final 10 Days"}
        ]

        return {
            "user_id": user_id,
            "student_class": student_class,
            "exam_date": exam_date.strftime("%Y-%m-%d"),
            "days_remaining": days_remaining,
            "recommended_hours": rec_info["recommended_daily_hours"],
            "recommendation_reason": rec_info["recommendation_reason"],
            "weak_topics_count": len(weak_list),
            "today_tasks": today_tasks,
            "weekly_timetable": weekly_timetable,
            "exam_milestones": exam_milestones,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
