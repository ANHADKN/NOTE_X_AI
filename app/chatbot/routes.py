import datetime
from flask import Blueprint, request, Response, stream_with_context
from bson import ObjectId
from app.utils.auth import token_required
from app.utils.response import api_response
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.services.openai_service import AIService
from app.utils.logger import logger

chatbot_bp = Blueprint('chatbot_bp', __name__, url_prefix='/api/chatbot')

IN_MEMORY_CHAT_HISTORY = {}

@chatbot_bp.route('/message', methods=['POST'])
@token_required
def send_message():
    """Send a message to noteX AI Chatbot and retrieve full response."""
    try:
        data = request.get_json() or {}
        prompt = (data.get('prompt') or data.get('message') or '').strip()
        subject = data.get('subject', 'General')
        user_info = request.user
        user_id = user_info.get('user_id')
        email = user_info.get('email')
        student_class = user_info.get('student_class', 'Class 10')

        if not prompt:
            return api_response(success=False, message="Prompt cannot be empty.", status_code=400)

        db = mongo_manager.get_db()
        history = []

        if db is not None:
            raw_hist = list(db.chat_history.find({"user_id": user_id}).sort("created_at", -1).limit(6))
            history = list(reversed(raw_hist))
        else:
            history = IN_MEMORY_CHAT_HISTORY.get(user_id, [])[-6:]

        from app.services.ai_router import AIRouter

        # Analyze intent and route through AI Router Engine
        router_result = AIRouter.analyze_and_route(user_id=user_id, prompt=prompt, student_class=student_class)
        ai_response_text = router_result.get("response", "")

        chat_record = {
            "user_id": user_id,
            "prompt": prompt,
            "response": ai_response_text,
            "intent": router_result.get("intent"),
            "action": router_result.get("action"),
            "action_url": router_result.get("action_url"),
            "action_title": router_result.get("action_title"),
            "student_class": student_class,
            "subject": subject,
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        if db is not None:
            db.chat_history.insert_one(chat_record)
        else:
            if user_id not in IN_MEMORY_CHAT_HISTORY:
                IN_MEMORY_CHAT_HISTORY[user_id] = []
            IN_MEMORY_CHAT_HISTORY[user_id].append(chat_record)

        return api_response(
            success=True,
            data={
                "response": ai_response_text,
                "intent": router_result.get("intent"),
                "action": router_result.get("action"),
                "action_url": router_result.get("action_url"),
                "action_title": router_result.get("action_title"),
                "conversation_id": user_id
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Chatbot Message Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/stream', methods=['POST'])
@token_required
def stream_message():
    """Stream real-time typing response for live chat interaction."""
    try:
        data = request.get_json() or {}
        prompt = data.get('prompt', '').strip()
        subject = data.get('subject', 'General')
        user_info = request.user
        student_class = user_info.get('student_class', 'Class 10')

        if not prompt:
            return api_response(success=False, message="Prompt cannot be empty.", status_code=400)

        return Response(
            stream_with_context(AIService.stream_chat_response(prompt, student_class, subject)),
            mimetype='text/event-stream'
        )
    except Exception as e:
        logger.error(f"Chatbot Streaming Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/history', methods=['GET'])
@token_required
def get_history():
    """Retrieve chat history logs for current user."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        db = mongo_manager.get_db()

        if db is not None:
            raw_hist = list(db.chat_history.find({"user_id": user_id}).sort("created_at", 1).limit(50))
            serialized = BaseModel.serialize_doc(raw_hist)
        else:
            serialized = IN_MEMORY_CHAT_HISTORY.get(user_id, [])

        return api_response(success=True, data={"history": serialized}, status_code=200)
    except Exception as e:
        logger.error(f"Chatbot History Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/history', methods=['DELETE'])
@token_required
def clear_history():
    """Clear chat history logs for current user."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        db = mongo_manager.get_db()

        if db is not None:
            db.chat_history.delete_many({"user_id": user_id})
        else:
            IN_MEMORY_CHAT_HISTORY[user_id] = []

        return api_response(success=True, message="Chat history cleared successfully.", status_code=200)
    except Exception as e:
        logger.error(f"Clear History Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/suggested', methods=['GET'])
@token_required
def get_suggested_questions():
    """Returns grade-tailored suggested prompt chips."""
    try:
        user_info = request.user
        student_class = user_info.get('student_class', 'Class 10')

        class_num = 10
        try:
            class_num = int(student_class.replace('Class ', ''))
        except Exception:
            pass

        if class_num <= 5:
            suggestions = [
                "Explain Photosynthesis in simple words with pictures",
                "What are Solar System planets in order?",
                "How do we solve double digit addition with carrying?",
                "Tell me a short story with a moral lesson"
            ]
        elif class_num <= 10:
            suggestions = [
                "Explain Pythagoras theorem with an example step-by-step",
                "What is the difference between Acids and Bases?",
                "How do Newton's Three Laws of Motion work?",
                "Give me 5 important formulas for Board Exams in Mathematics"
            ]
        else: # Class 11 & 12
            suggestions = [
                "Derive Schrödinger's wave equation key concepts in Physics",
                "Explain IUPAC nomenclature rules for organic Chemistry",
                "What is Calculus integration by parts formula and method?",
                "How does DNA Replication work in Molecular Biology?"
            ]

        return api_response(success=True, data={"student_class": student_class, "suggestions": suggestions}, status_code=200)
    except Exception as e:
        logger.error(f"Suggested Questions Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
