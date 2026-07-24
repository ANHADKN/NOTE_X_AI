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
            "student_class": student_class,
            "role": role,
            "target_exam": target_exam,
            "is_verified": False,
            "preferred_theme": "dark",
            "study_streak": 1,
            "total_points": 50,
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }

class OTPModel:
    """OTP Verification schema."""
    @staticmethod
    def create_otp_doc(email, otp_code, purpose="email_verification"):
        return {
            "email": email.lower().strip(),
            "otp_code": otp_code,
            "purpose": purpose,
            "is_used": False,
            "created_at": datetime.datetime.utcnow(),
            "expires_at": datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
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
