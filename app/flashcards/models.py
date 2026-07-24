import datetime
from bson import ObjectId

class FlashcardDeckModel:
    """MongoDB Schema for Flashcard Decks."""

    @staticmethod
    def create_deck_doc(user_id: str, title: str, subject: str, student_class: str, card_count: int) -> dict:
        return {
            "user_id": user_id,
            "title": title,
            "subject": subject,
            "student_class": student_class,
            "card_count": card_count,
            "created_at": datetime.datetime.utcnow().isoformat()
        }

class FlashcardModel:
    """MongoDB Schema for Individual Flashcards."""

    @staticmethod
    def create_card_doc(deck_id: str, user_id: str, front: str, back: str, difficulty: str = "Medium", mnemonic: str = "") -> dict:
        return {
            "deck_id": deck_id,
            "user_id": user_id,
            "front": front,
            "back": back,
            "difficulty": difficulty,  # Easy, Medium, Hard
            "mnemonic": mnemonic,
            "review_count": 0,
            "last_reviewed_at": None,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
