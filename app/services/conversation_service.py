"""noteX AI - Conversation Memory & Session Storage Service for MongoDB."""
import datetime
from bson import ObjectId
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.utils.logger import logger

IN_MEMORY_CONVERSATIONS = {}

class ConversationService:
    """Conversation Memory manager storing user messages, AI responses, session IDs, and timestamps."""

    @classmethod
    def save_conversation_turn(cls, user_id: str, session_id: str, user_message: str, ai_response: str, student_class: str = "Class 10", subject: str = "General", intent: str = "GENERAL_TUTOR_CHAT") -> dict:
        """Saves a conversation turn (User message + AI response + Session ID + Timestamp) in MongoDB."""
        timestamp = datetime.datetime.utcnow().isoformat()
        
        doc = {
            "user_id": user_id,
            "session_id": session_id,
            "user_message": user_message,
            "prompt": user_message,  # Backwards compatibility field
            "ai_response": ai_response,
            "response": ai_response,  # Backwards compatibility field
            "student_class": student_class,
            "subject": subject,
            "intent": intent,
            "timestamp": timestamp,
            "created_at": timestamp
        }

        db = mongo_manager.get_db()
        if db is not None:
            try:
                res = db.conversations.insert_one(doc)
                doc['id'] = str(res.inserted_id)
                # Also mirror into legacy chat_history for backward compatibility
                db.chat_history.insert_one(doc.copy())
            except Exception as e:
                logger.error(f"[ConversationService] Error saving turn to MongoDB: {str(e)}")
        else:
            if user_id not in IN_MEMORY_CONVERSATIONS:
                IN_MEMORY_CONVERSATIONS[user_id] = {}
            if session_id not in IN_MEMORY_CONVERSATIONS[user_id]:
                IN_MEMORY_CONVERSATIONS[user_id][session_id] = []
            
            doc['id'] = f"turn_{len(IN_MEMORY_CONVERSATIONS[user_id][session_id]) + 1}"
            IN_MEMORY_CONVERSATIONS[user_id][session_id].append(doc)

        logger.info(f"[ConversationService] Saved conversation turn for Session '{session_id}' (User: {user_id})")
        return doc

    @classmethod
    def get_conversation_history(cls, user_id: str, session_id: str = None, limit: int = 10) -> list:
        """Automatically retrieves previous conversation turns for session continuity."""
        db = mongo_manager.get_db()

        if db is not None:
            try:
                query = {"user_id": user_id}
                if session_id:
                    query["session_id"] = session_id

                raw_turns = list(db.conversations.find(query).sort("timestamp", -1).limit(limit))
                ordered_turns = list(reversed(raw_turns))
                return BaseModel.serialize_doc(ordered_turns)
            except Exception as e:
                logger.error(f"[ConversationService] Error fetching history from MongoDB: {str(e)}")

        # Fallback to in-memory store
        user_sessions = IN_MEMORY_CONVERSATIONS.get(user_id, {})
        if session_id and session_id in user_sessions:
            return user_sessions[session_id][-limit:]
        
        # If no session_id specified, return all recent turns for user
        all_turns = []
        for sess_id, turns in user_sessions.items():
            all_turns.extend(turns)
        all_turns.sort(key=lambda x: x.get('timestamp', ''))
        return all_turns[-limit:]

    @classmethod
    def get_user_sessions(cls, user_id: str) -> list:
        """Returns list of previous conversation sessions/threads for current user."""
        db = mongo_manager.get_db()

        if db is not None:
            try:
                pipeline = [
                    {"$match": {"user_id": user_id}},
                    {"$sort": {"timestamp": -1}},
                    {"$group": {
                        "_id": "$session_id",
                        "session_id": {"$first": "$session_id"},
                        "first_prompt": {"$first": "$user_message"},
                        "last_updated": {"$first": "$timestamp"},
                        "message_count": {"$sum": 1}
                    }},
                    {"$sort": {"last_updated": -1}}
                ]
                results = list(db.conversations.aggregate(pipeline))
                sessions = []
                for r in results:
                    sess_id = r.get("session_id") or str(r.get("_id"))
                    prompt_preview = r.get("first_prompt", "Study Conversation")
                    sessions.append({
                        "id": sess_id,
                        "session_id": sess_id,
                        "title": prompt_preview[:35] + ("..." if len(prompt_preview) > 35 else ""),
                        "last_updated": r.get("last_updated"),
                        "message_count": r.get("message_count", 1)
                    })
                return sessions
            except Exception as e:
                logger.error(f"[ConversationService] Error getting sessions from MongoDB: {str(e)}")

        # In-memory fallback
        user_sessions = IN_MEMORY_CONVERSATIONS.get(user_id, {})
        sessions = []
        for sess_id, turns in user_sessions.items():
            if turns:
                first_prompt = turns[0].get('user_message', 'Study Conversation')
                sessions.append({
                    "id": sess_id,
                    "session_id": sess_id,
                    "title": first_prompt[:35] + ("..." if len(first_prompt) > 35 else ""),
                    "last_updated": turns[-1].get('timestamp'),
                    "message_count": len(turns)
                })
        return sessions

    @classmethod
    def delete_session(cls, user_id: str, session_id: str) -> bool:
        """Deletes a specific conversation thread session."""
        db = mongo_manager.get_db()
        if db is not None:
            try:
                db.conversations.delete_many({"user_id": user_id, "session_id": session_id})
                db.chat_history.delete_many({"user_id": user_id, "session_id": session_id})
                return True
            except Exception as e:
                logger.error(f"[ConversationService] Error deleting session: {str(e)}")

        if user_id in IN_MEMORY_CONVERSATIONS and session_id in IN_MEMORY_CONVERSATIONS[user_id]:
            del IN_MEMORY_CONVERSATIONS[user_id][session_id]
        return True

    @classmethod
    def clear_all_history(cls, user_id: str) -> bool:
        """Clears all conversation memory for user."""
        db = mongo_manager.get_db()
        if db is not None:
            try:
                db.conversations.delete_many({"user_id": user_id})
                db.chat_history.delete_many({"user_id": user_id})
            except Exception as e:
                logger.error(f"[ConversationService] Error clearing user history: {str(e)}")

        IN_MEMORY_CONVERSATIONS[user_id] = {}
        return True
