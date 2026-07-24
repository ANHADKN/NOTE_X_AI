import datetime
from bson import ObjectId
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.notes.models import NoteModel
from app.utils.logger import logger

IN_MEMORY_NOTES_STORE = {}

class NoteService:
    """Database service managing 'notes' MongoDB collection."""

    @classmethod
    def save_note(cls, user_id: str, subject: str, chapter: str, note_type: str, content: str, student_class: str = "Class 10") -> dict:
        """Saves a note document to database."""
        note_doc = NoteModel.create_note_doc(
            user_id=user_id,
            subject=subject,
            chapter=chapter,
            note_type=note_type,
            content=content,
            student_class=student_class
        )

        db = mongo_manager.get_db()
        if db is not None:
            res = db.notes.insert_one(note_doc)
            note_doc['id'] = str(res.inserted_id)
        else:
            note_id = f"note_{len(IN_MEMORY_NOTES_STORE) + 1}"
            note_doc['id'] = note_id
            IN_MEMORY_NOTES_STORE[note_id] = note_doc

        return BaseModel.serialize_doc(note_doc)

    @classmethod
    def get_user_notes(cls, user_id: str, subject: str = None, note_type: str = None) -> list:
        """Fetch list of saved notes for a user."""
        db = mongo_manager.get_db()

        if db is not None:
            query = {"user_id": user_id}
            if subject:
                query["subject"] = subject
            if note_type:
                query["note_type"] = note_type
            raw = list(db.notes.find(query).sort("created_at", -1))
            return BaseModel.serialize_doc(raw)
        else:
            notes = [v for k, v in IN_MEMORY_NOTES_STORE.items() if v.get('user_id') == user_id]
            if subject:
                notes = [n for n in notes if n.get('subject') == subject]
            if note_type:
                notes = [n for n in notes if n.get('note_type') == note_type]
            return BaseModel.serialize_doc(notes)

    @classmethod
    def get_note_by_id(cls, user_id: str, note_id: str) -> dict:
        """Fetch single note by ID."""
        db = mongo_manager.get_db()
        note = None

        if db is not None:
            try:
                note = db.notes.find_one({"_id": ObjectId(note_id), "user_id": user_id})
            except Exception:
                note = db.notes.find_one({"id": note_id, "user_id": user_id})
        else:
            note = IN_MEMORY_NOTES_STORE.get(note_id)

        return BaseModel.serialize_doc(note)

    @classmethod
    def delete_note(cls, user_id: str, note_id: str) -> bool:
        """Deletes a note from database."""
        db = mongo_manager.get_db()
        if db is not None:
            try:
                db.notes.delete_one({"_id": ObjectId(note_id), "user_id": user_id})
            except Exception:
                db.notes.delete_one({"id": note_id, "user_id": user_id})
        else:
            if note_id in IN_MEMORY_NOTES_STORE:
                del IN_MEMORY_NOTES_STORE[note_id]
        return True
