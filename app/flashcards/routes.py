from flask import Blueprint, request
from app.utils.auth import token_required
from app.utils.response import api_response
from app.flashcards.services import FlashcardService
from app.models.mongo import mongo_manager
from app.utils.logger import logger

flashcards_bp = Blueprint('flashcards_bp', __name__, url_prefix='/api/flashcards')

@flashcards_bp.route('/generate', methods=['POST'])
@token_required
def generate_flashcards():
    """Generate a new AI Flashcard deck."""
    try:
        data = request.get_json() or {}
        subject = data.get('subject', 'Science').strip()
        topic = data.get('topic', '').strip()
        count = int(data.get('count', 5))

        if not topic:
            return api_response(success=False, message="Topic name is required.", status_code=400)

        user_info = request.user
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')

        deck = FlashcardService.generate_and_save_deck(
            user_id=user_id,
            subject=subject,
            topic=topic,
            count=count,
            student_class=student_class
        )

        return api_response(success=True, message=f"Flashcard deck for '{topic}' created!", data={"deck": deck}, status_code=201)
    except Exception as e:
        logger.error(f"Generate Flashcards Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@flashcards_bp.route('/decks', methods=['GET'])
@token_required
def get_decks():
    """Fetch user's flashcard decks library."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')

        decks = FlashcardService.get_user_decks(user_id)
        return api_response(success=True, data={"decks": decks}, status_code=200)
    except Exception as e:
        logger.error(f"Get Decks Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@flashcards_bp.route('/deck/<deck_id>', methods=['GET'])
@token_required
def get_deck_cards(deck_id):
    """Fetch cards belonging to a deck."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')

        cards = FlashcardService.get_deck_cards(user_id, deck_id)
        return api_response(success=True, data={"cards": cards}, status_code=200)
    except Exception as e:
        logger.error(f"Get Deck Cards Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@flashcards_bp.route('/review', methods=['POST'])
@token_required
def review_card():
    """Submit difficulty rating for spaced repetition review."""
    try:
        data = request.get_json() or {}
        card_id = data.get('card_id')
        difficulty = data.get('difficulty', 'Medium')

        if not card_id:
            return api_response(success=False, message="card_id is required.", status_code=400)

        user_info = request.user
        user_id = user_info.get('user_id')

        res = FlashcardService.review_card(user_id, card_id, difficulty)
        return api_response(success=True, message=f"Card reviewed! (+{res['xp_earned']} XP)", data=res, status_code=200)
    except Exception as e:
        logger.error(f"Review Card Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@flashcards_bp.route('/deck/<deck_id>', methods=['DELETE'])
@token_required
def delete_deck(deck_id):
    """Delete a flashcard deck."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        db = mongo_manager.get_db()

        if db is not None:
            from bson import ObjectId
            try:
                db.flashcard_decks.delete_one({"_id": ObjectId(deck_id), "user_id": user_id})
                db.flashcards.delete_many({"deck_id": deck_id, "user_id": user_id})
            except Exception:
                db.flashcard_decks.delete_one({"id": deck_id, "user_id": user_id})
                db.flashcards.delete_many({"deck_id": deck_id, "user_id": user_id})
        else:
            from app.flashcards.services import IN_MEMORY_DECKS, IN_MEMORY_CARDS
            if deck_id in IN_MEMORY_DECKS:
                del IN_MEMORY_DECKS[deck_id]
            to_del = [k for k, v in IN_MEMORY_CARDS.items() if v.get('deck_id') == deck_id]
            for k in to_del:
                del IN_MEMORY_CARDS[k]

        return api_response(success=True, message="Deck deleted successfully.", status_code=200)
    except Exception as e:
        logger.error(f"Delete Deck Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
