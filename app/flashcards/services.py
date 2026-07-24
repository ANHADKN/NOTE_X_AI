import datetime
from bson import ObjectId
from app.models.mongo import mongo_manager
from app.models.schemas import BaseModel
from app.flashcards.models import FlashcardDeckModel, FlashcardModel
from app.flashcards.ai_flashcards import AIFlashcardGenerator
from app.utils.logger import logger

IN_MEMORY_DECKS = {}
IN_MEMORY_CARDS = {}

class FlashcardService:
    """Database service managing 'flashcard_decks' and 'flashcards' MongoDB collections."""

    @classmethod
    def generate_and_save_deck(cls, user_id: str, subject: str, topic: str, count: int = 5, student_class: str = "Class 10") -> dict:
        cards_data = AIFlashcardGenerator.generate_cards(subject, topic, count, student_class)

        deck_doc = FlashcardDeckModel.create_deck_doc(
            user_id=user_id,
            title=f"{topic} Flashcards",
            subject=subject,
            student_class=student_class,
            card_count=len(cards_data)
        )

        db = mongo_manager.get_db()
        saved_cards = []

        if db is not None:
            res = db.flashcard_decks.insert_one(deck_doc)
            deck_id = str(res.inserted_id)
            deck_doc['id'] = deck_id

            for c in cards_data:
                card_doc = FlashcardModel.create_card_doc(
                    deck_id=deck_id,
                    user_id=user_id,
                    front=c.get('front'),
                    back=c.get('back'),
                    difficulty=c.get('difficulty', 'Medium'),
                    mnemonic=c.get('mnemonic', '')
                )
                c_res = db.flashcards.insert_one(card_doc)
                card_doc['id'] = str(c_res.inserted_id)
                saved_cards.append(BaseModel.serialize_doc(card_doc))
        else:
            deck_id = f"deck_{len(IN_MEMORY_DECKS) + 1}"
            deck_doc['id'] = deck_id
            IN_MEMORY_DECKS[deck_id] = deck_doc

            for idx, c in enumerate(cards_data):
                card_id = f"card_{deck_id}_{idx+1}"
                card_doc = FlashcardModel.create_card_doc(
                    deck_id=deck_id,
                    user_id=user_id,
                    front=c.get('front'),
                    back=c.get('back'),
                    difficulty=c.get('difficulty', 'Medium'),
                    mnemonic=c.get('mnemonic', '')
                )
                card_doc['id'] = card_id
                IN_MEMORY_CARDS[card_id] = card_doc
                saved_cards.append(card_doc)

        result_deck = BaseModel.serialize_doc(deck_doc)
        result_deck['cards'] = saved_cards
        return result_deck

    @classmethod
    def get_user_decks(cls, user_id: str) -> list:
        db = mongo_manager.get_db()
        if db is not None:
            raw = list(db.flashcard_decks.find({"user_id": user_id}).sort("created_at", -1))
            return BaseModel.serialize_doc(raw)
        else:
            decks = [v for k, v in IN_MEMORY_DECKS.items() if v.get('user_id') == user_id]
            return BaseModel.serialize_doc(decks)

    @classmethod
    def get_deck_cards(cls, user_id: str, deck_id: str) -> list:
        db = mongo_manager.get_db()
        if db is not None:
            raw = list(db.flashcards.find({"deck_id": deck_id, "user_id": user_id}))
            return BaseModel.serialize_doc(raw)
        else:
            cards = [v for k, v in IN_MEMORY_CARDS.items() if v.get('deck_id') == deck_id and v.get('user_id') == user_id]
            return BaseModel.serialize_doc(cards)

    @classmethod
    def review_card(cls, user_id: str, card_id: str, difficulty: str) -> dict:
        """Logs student difficulty rating (Easy, Medium, Hard) and awards XP."""
        xp_earned = 15 if difficulty.lower() == 'easy' else (10 if difficulty.lower() == 'medium' else 5)
        db = mongo_manager.get_db()

        if db is not None:
            try:
                db.flashcards.update_one(
                    {"_id": ObjectId(card_id), "user_id": user_id},
                    {
                        "$set": {"difficulty": difficulty, "last_reviewed_at": datetime.datetime.utcnow().isoformat()},
                        "$inc": {"review_count": 1}
                    }
                )
                db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"total_points": xp_earned}})
            except Exception:
                pass
        else:
            card = IN_MEMORY_CARDS.get(card_id)
            if card:
                card['difficulty'] = difficulty
                card['review_count'] = card.get('review_count', 0) + 1

        return {"card_id": card_id, "difficulty": difficulty, "xp_earned": xp_earned}
