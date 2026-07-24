"""noteX AI - Unified My Library Database Service."""
import datetime
from bson import ObjectId
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.utils.logger import logger

class LibraryService:
    """Database service aggregating all student study assets from MongoDB."""

    @classmethod
    def get_user_library_assets(cls, user_id: str, asset_type: str = "all", search_query: str = "") -> dict:
        db = mongo_manager.get_db()
        assets = []

        if db is not None:
            # 1. PDFs Documents
            if asset_type in ["all", "pdfs"]:
                docs = list(db.documents.find({"user_id": user_id}).sort("created_at", -1))
                for d in docs:
                    assets.append({
                        "id": str(d.get("_id", d.get("id"))),
                        "type": "pdf",
                        "title": d.get("filename", "PDF Document"),
                        "subject": d.get("subject", "General"),
                        "created_at": d.get("created_at", datetime.datetime.utcnow().isoformat()),
                        "details": f"{d.get('num_pages', 1)} Pages • {d.get('num_chunks', 0)} Vectors",
                        "file_path": d.get("filepath", "")
                    })

            # 2. AI Notes
            if asset_type in ["all", "notes"]:
                notes = list(db.notes.find({"user_id": user_id}).sort("created_at", -1))
                for n in notes:
                    assets.append({
                        "id": str(n.get("_id", n.get("id"))),
                        "type": "note",
                        "title": f"{n.get('chapter', 'Study Note')} ({n.get('note_type', 'Smart Note')})",
                        "subject": n.get("subject", "Science"),
                        "created_at": n.get("created_at", datetime.datetime.utcnow().isoformat()),
                        "details": n.get("content", "")[:120] + "...",
                        "content": n.get("content", "")
                    })

            # 3. Flashcards
            if asset_type in ["all", "flashcards"]:
                decks = list(db.flashcard_decks.find({"user_id": user_id}).sort("created_at", -1))
                for f in decks:
                    assets.append({
                        "id": str(f.get("_id", f.get("id"))),
                        "type": "flashcard",
                        "title": f.get("title", "Flashcard Deck"),
                        "subject": f.get("subject", "General"),
                        "created_at": f.get("created_at", datetime.datetime.utcnow().isoformat()),
                        "details": f"{f.get('card_count', 5)} Active Recall Cards"
                    })

            # 4. Quizzes
            if asset_type in ["all", "quizzes"]:
                quizzes = list(db.quizzes.find({"user_id": user_id}).sort("created_at", -1))
                for q in quizzes:
                    assets.append({
                        "id": str(q.get("_id", q.get("id"))),
                        "type": "quiz",
                        "title": q.get("title", "AI Quiz"),
                        "subject": q.get("subject", "Science"),
                        "created_at": q.get("created_at", datetime.datetime.utcnow().isoformat()),
                        "details": f"{len(q.get('questions', []))} Questions • {q.get('quiz_type', 'MCQ').upper()}"
                    })

            # 5. Study Plans
            if asset_type in ["all", "plans"]:
                plans = list(db.study_plans.find({"user_id": user_id}).sort("created_at", -1))
                for p in plans:
                    assets.append({
                        "id": str(p.get("_id", p.get("id"))),
                        "type": "plan",
                        "title": f"Study Schedule ({p.get('class', 'Class 10')})",
                        "subject": "All Subjects",
                        "created_at": p.get("created_at", datetime.datetime.utcnow().isoformat()),
                        "details": f"Weekly Timetable & Exam Milestones"
                    })

            # 6. Chat History
            if asset_type in ["all", "chats"]:
                chats = list(db.chat_history.find({"user_id": user_id}).sort("created_at", -1).limit(10))
                for c in chats:
                    assets.append({
                        "id": str(c.get("_id", c.get("id"))),
                        "type": "chat",
                        "title": f"Chat: {c.get('prompt', 'Study Session')[:30]}...",
                        "subject": c.get("subject", "General"),
                        "created_at": c.get("created_at", datetime.datetime.utcnow().isoformat()),
                        "details": c.get("response", "")[:100] + "...",
                        "content": c.get("response", "")
                    })
        else:
            # Fallback sample library items
            assets = [
                {"id": "ast_1", "type": "pdf", "title": "Science_Chapter_4.pdf", "subject": "Science", "created_at": datetime.datetime.utcnow().isoformat(), "details": "12 Pages • 36 Vectors"},
                {"id": "ast_2", "type": "note", "title": "Electricity Revision Notes", "subject": "Physics", "created_at": datetime.datetime.utcnow().isoformat(), "details": "High-yield formulas & definitions", "content": "Sample formula sheet for Electricity."},
                {"id": "ast_3", "type": "flashcard", "title": "Chemical Reactions Deck", "subject": "Chemistry", "created_at": datetime.datetime.utcnow().isoformat(), "details": "5 Active Recall Cards"},
                {"id": "ast_4", "type": "quiz", "title": "Photosynthesis MCQ Test", "subject": "Biology", "created_at": datetime.datetime.utcnow().isoformat(), "details": "5 Questions • MCQ"}
            ]

        # Apply search filter if query is provided
        if search_query:
            q_lower = search_query.lower()
            assets = [a for a in assets if q_lower in a['title'].lower() or q_lower in a['subject'].lower()]

        return {"total_assets": len(assets), "assets": assets}

    @classmethod
    def delete_asset(cls, asset_type: str, asset_id: str) -> bool:
        """Deletes asset from specific collection."""
        db = mongo_manager.get_db()
        if db is None:
            return True

        coll_map = {
            "pdf": db.documents,
            "note": db.notes,
            "flashcard": db.flashcard_decks,
            "quiz": db.quizzes,
            "plan": db.study_plans,
            "chat": db.chat_history
        }

        target_coll = coll_map.get(asset_type)
        if target_coll is not None:
            try:
                target_coll.delete_one({"_id": ObjectId(asset_id)})
            except Exception:
                target_coll.delete_one({"id": asset_id})
            return True
        return False

    @classmethod
    def rename_asset(cls, asset_type: str, asset_id: str, new_title: str) -> bool:
        """Renames asset in specific collection."""
        db = mongo_manager.get_db()
        if db is None:
            return True

        coll_map = {
            "pdf": (db.documents, "filename"),
            "note": (db.notes, "chapter"),
            "flashcard": (db.flashcard_decks, "title"),
            "quiz": (db.quizzes, "title"),
            "chat": (db.chat_history, "prompt")
        }

        if asset_type in coll_map:
            coll, field = coll_map[asset_type]
            try:
                coll.update_one({"_id": ObjectId(asset_id)}, {"$set": {field: new_title}})
            except Exception:
                coll.update_one({"id": asset_id}, {"$set": {field: new_title}})
            return True
        return False
