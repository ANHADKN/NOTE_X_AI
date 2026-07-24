import datetime
from bson import ObjectId

class NoteModel:
    """MongoDB schema for AI Smart Notes."""

    @staticmethod
    def create_note_doc(user_id: str, subject: str, chapter: str, note_type: str, content: str, student_class: str = "Class 10") -> dict:
        return {
            "user_id": user_id,
            "subject": subject,
            "chapter": chapter,
            "note_type": note_type,
            "content": content,
            "student_class": student_class,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
