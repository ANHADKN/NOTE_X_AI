import datetime
from bson import ObjectId

class BaseModel:
    @staticmethod
    def serialize_doc(doc):
        """Converts BSON ObjectId and datetime objects to JSON serializable formats."""
        if doc is None:
            return None
        if isinstance(doc, list):
            return [BaseModel.serialize_doc(item) for item in doc]
        if isinstance(doc, dict):
            new_doc = {}
            for k, v in doc.items():
                if k == '_id':
                    new_doc['id'] = str(v)
                elif isinstance(v, ObjectId):
                    new_doc[k] = str(v)
                elif isinstance(v, datetime.datetime):
                    new_doc[k] = v.isoformat()
                elif isinstance(v, dict):
                    new_doc[k] = BaseModel.serialize_doc(v)
                elif isinstance(v, list):
                    new_doc[k] = BaseModel.serialize_doc(v)
                else:
                    new_doc[k] = v
            return new_doc
        return doc

class UserModel:
    """User Model schema for Class 1 - Class 12 students and admins."""
    @staticmethod
    def create_user_doc(name, email, password_hash, student_class="Class 10", role="student", target_exam="Board Exam"):
        return {
            "name": name,
            "email": email.lower().strip(),
            "password_hash": password_hash,
            "student_class": student_class,  # e.g., 'Class 1', 'Class 5', 'Class 10', 'Class 12'
            "role": role,                    # 'student' or 'admin'
            "target_exam": target_exam,      # e.g., 'CBSE', 'ICSE', 'State Board', 'JEE', 'NEET'
            "preferred_theme": "dark",
            "study_streak": 1,
            "total_points": 50,              # Gamification points
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }

class ChatMessageModel:
    """Chat message schema for RAG & General AI Chatbot."""
    @staticmethod
    def create_chat_doc(user_id, prompt, response, student_class, subject="General", sources=None):
        return {
            "user_id": user_id,
            "prompt": prompt,
            "response": response,
            "student_class": student_class,
            "subject": subject,
            "sources": sources or [],
            "created_at": datetime.datetime.utcnow()
        }

class NoteModel:
    """Smart / Key / Short notes model."""
    @staticmethod
    def create_note_doc(user_id, title, content, note_type, student_class, subject="General", tags=None):
        return {
            "user_id": user_id,
            "title": title,
            "content": content,
            "note_type": note_type,          # 'smart', 'key', 'short'
            "student_class": student_class,
            "subject": subject,
            "tags": tags or [],
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }

class DocumentModel:
    """Ingested PDF document metadata schema."""
    @staticmethod
    def create_doc_record(user_id, filename, filepath, num_pages, num_chunks, student_class, subject):
        return {
            "user_id": user_id,
            "filename": filename,
            "filepath": filepath,
            "num_pages": num_pages,
            "num_chunks": num_chunks,
            "student_class": student_class,
            "subject": subject,
            "uploaded_at": datetime.datetime.utcnow()
        }

class QuizModel:
    """Generated Quiz & Flashcard Schema."""
    @staticmethod
    def create_quiz_doc(user_id, title, subject, student_class, questions, quiz_type="quiz"):
        return {
            "user_id": user_id,
            "title": title,
            "subject": subject,
            "student_class": student_class,
            "quiz_type": quiz_type,          # 'quiz', 'question_paper', 'flashcards'
            "questions": questions,          # list of question objects
            "created_at": datetime.datetime.utcnow()
        }
