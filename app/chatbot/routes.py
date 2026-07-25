import json
import datetime
from flask import Blueprint, request, Response, stream_with_context
from bson import ObjectId
from app.utils.auth import token_required
from app.utils.response import api_response
from app.models.mongo import mongo_manager
from app.services.conversation_service import ConversationService
from app.services.ai_router import AIRouter
from app.services.ai_service import AIService
from app.utils.logger import logger

chatbot_bp = Blueprint('chatbot_bp', __name__, url_prefix='/api/chatbot')
chat_alias_bp = Blueprint('chat_alias_bp', __name__, url_prefix='/api/chat')

@chatbot_bp.route('/message', methods=['POST'])
@chat_alias_bp.route('/message', methods=['POST'])
@token_required
def send_message():
    """Send a message to noteX AI Chatbot with persistent session memory in MongoDB."""
    try:
        data = request.get_json() or {}
        prompt = (data.get('prompt') or data.get('message') or data.get('user_message') or '').strip()
        subject = data.get('subject', 'General')
        user_info = request.user
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')
        
        # Resolve Session ID (allows users to continue previous conversations)
        session_id = data.get('session_id') or data.get('conversation_id') or f"session_{user_id}_main"

        if not prompt:
            return api_response(success=False, message="Prompt cannot be empty.", status_code=400)

        # 1. Retrieve previous messages automatically for context memory
        history = ConversationService.get_conversation_history(user_id=user_id, session_id=session_id, limit=8)

        # 2. Analyze intent and route through AI Router Engine (with Groq API)
        router_result = AIRouter.analyze_and_route(
            user_id=user_id,
            prompt=prompt,
            student_class=student_class,
            history=history,
            session_id=session_id
        )
        ai_response_text = router_result.get("response", "").strip()

        if not ai_response_text:
            ai_response_text = f"### 📚 noteX AI Study Assistant\n\nI have received your query regarding **\"{prompt}\"**. Please select a specific topic or chapter to explore further."

        intent = router_result.get("intent", "GENERAL_TUTOR_CHAT")

        # 3. Save User message + AI response + Session ID + Timestamp in MongoDB
        ConversationService.save_conversation_turn(
            user_id=user_id,
            session_id=session_id,
            user_message=prompt,
            ai_response=ai_response_text,
            student_class=student_class,
            subject=subject,
            intent=intent
        )

        return api_response(
            success=True,
            data={
                "response": ai_response_text,
                "ai_response": ai_response_text,
                "text": ai_response_text,
                "session_id": session_id,
                "conversation_id": session_id,
                "intent": intent,
                "action": router_result.get("action"),
                "action_url": router_result.get("action_url"),
                "action_title": router_result.get("action_title")
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Chatbot Message Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/stream', methods=['POST'])
@chat_alias_bp.route('/stream', methods=['POST'])
@token_required
def stream_message():
    """Stream real-time typing SSE response with MongoDB memory persistence and token display."""
    try:
        data = request.get_json() or {}
        prompt = (data.get('prompt') or data.get('message') or '').strip()
        subject = data.get('subject', 'General')
        user_info = request.user
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')
        session_id = data.get('session_id') or data.get('conversation_id') or f"session_{user_id}_main"

        if not prompt:
            return api_response(success=False, message="Prompt cannot be empty.", status_code=400)

        # Pre-route to extract intent and action metadata
        history = ConversationService.get_conversation_history(user_id=user_id, session_id=session_id, limit=8)
        router_result = AIRouter.analyze_and_route(
            user_id=user_id,
            prompt=prompt,
            student_class=student_class,
            history=history,
            session_id=session_id
        )

        def generate_sse():
            full_response_chunks = []

            for sse_data in AIService.stream_chat_response(user_prompt=prompt, student_class=student_class, subject=subject, history=history):
                if sse_data.startswith("data: "):
                    raw_str = sse_data.replace('data: ', '').strip()
                    if raw_str == "[DONE]":
                        break
                    try:
                        parsed = json.loads(raw_str)
                        chunk_val = parsed.get('chunk') or parsed.get('token') or ''
                        if chunk_val:
                            full_response_chunks.append(chunk_val)
                    except Exception:
                        pass
                yield sse_data

            # Fallback if streaming produced empty chunks
            completed_text = "".join(full_response_chunks).strip()
            if not completed_text:
                completed_text = router_result.get("response", "### 📚 noteX AI Tutor\n\nI'm ready to assist you with your study session!").strip()
                yield f"data: {json.dumps({'chunk': completed_text})}\n\n"

            # Save completed response turn into MongoDB conversation memory
            ConversationService.save_conversation_turn(
                user_id=user_id,
                session_id=session_id,
                user_message=prompt,
                ai_response=completed_text,
                student_class=student_class,
                subject=subject,
                intent=router_result.get("intent", "GENERAL_TUTOR_CHAT")
            )

            # Send done signal with complete payload
            done_payload = {
                "done": True,
                "session_id": session_id,
                "conversation_id": session_id,
                "response": completed_text,
                "full_text": completed_text,
                "intent": router_result.get("intent"),
                "action": router_result.get("action"),
                "action_url": router_result.get("action_url"),
                "action_title": router_result.get("action_title")
            }
            yield f"data: {json.dumps(done_payload)}\n\n"

        return Response(stream_with_context(generate_sse()), mimetype='text/event-stream')
    except Exception as e:
        logger.error(f"Chatbot Streaming Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/history', methods=['GET'])
@chatbot_bp.route('/conversations', methods=['GET'])
@chat_alias_bp.route('/conversations', methods=['GET'])
@token_required
def get_history():
    """Retrieve chat history logs and conversation threads for current user."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        session_id = request.args.get('session_id')

        history_turns = ConversationService.get_conversation_history(user_id=user_id, session_id=session_id, limit=50)
        sessions = ConversationService.get_user_sessions(user_id=user_id)

        return api_response(
            success=True,
            data={
                "history": history_turns,
                "conversations": sessions,
                "sessions": sessions
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"Chatbot History Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/conversation/<id>', methods=['GET'])
@chat_alias_bp.route('/conversation/<id>', methods=['GET'])
@token_required
def get_conversation_thread(id):
    """Retrieve previous messages automatically for a specific conversation session."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')

        turns = ConversationService.get_conversation_history(user_id=user_id, session_id=id, limit=50)
        
        messages = []
        for t in turns:
            user_msg = t.get('user_message') or t.get('prompt') or ''
            ai_msg = t.get('ai_response') or t.get('response') or ''
            if user_msg:
                messages.append({"sender": "user", "text": user_msg, "timestamp": t.get("timestamp")})
            if ai_msg:
                messages.append({"sender": "ai", "text": ai_msg, "timestamp": t.get("timestamp")})

        return api_response(
            success=True,
            data={
                "conversation": {
                    "id": id,
                    "session_id": id,
                    "messages": messages,
                    "history": turns
                }
            },
            status_code=200
        )
    except Exception as e:
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/conversation/<id>', methods=['DELETE'])
@chat_alias_bp.route('/conversation/<id>', methods=['DELETE'])
@token_required
def delete_conversation_thread(id):
    """Delete a specific conversation session."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        ConversationService.delete_session(user_id=user_id, session_id=id)
        return api_response(success=True, message=f"Session '{id}' deleted successfully.", status_code=200)
    except Exception as e:
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/history', methods=['DELETE'])
@chat_alias_bp.route('/history', methods=['DELETE'])
@token_required
def clear_history():
    """Clear all conversation history logs for current user."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        ConversationService.clear_all_history(user_id=user_id)
        return api_response(success=True, message="All conversation memory cleared successfully.", status_code=200)
    except Exception as e:
        logger.error(f"Clear History Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@chatbot_bp.route('/suggested', methods=['GET'])
@chat_alias_bp.route('/suggested', methods=['GET'])
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
        else:
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
