import json
from app.services.openai_service import AIService
from app.utils.logger import logger

class AIFlashcardGenerator:
    """AI Engine for generating interactive study flashcards."""

    @classmethod
    def generate_cards(cls, subject: str, topic: str, count: int = 5, student_class: str = "Class 10") -> list:
        """Generates JSON flashcard items with Front, Back, Difficulty, and Mnemonics."""
        prompt = (
            f"Generate {count} educational flashcards for a {student_class} student.\n"
            f"Subject: '{subject}', Topic/Chapter: '{topic}'.\n\n"
            f"Return a strict JSON list of flashcard objects in the format:\n"
            f"[\n"
            f"  {{\n"
            f"    \"front\": \"Question, Key Term, or Concept on the front of the flashcard\",\n"
            f"    \"back\": \"Clear answer, formula, or concise explanation on the back\",\n"
            f"    \"difficulty\": \"Medium\",\n"
            f"    \"mnemonic\": \"Optional memory trick or hook\"\n"
            f"  }}\n"
            f"]"
        )

        try:
            raw_response = AIService.generate_chat_response(prompt, student_class, subject)
            start_idx = raw_response.find('[')
            end_idx = raw_response.rfind(']') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = raw_response[start_idx:end_idx]
                return json.loads(json_str)
        except Exception as e:
            logger.warning(f"JSON parsing error for flashcards: {str(e)}. Using fallback flashcard set.")

        return cls._generate_fallback_cards(subject, topic)

    @staticmethod
    def _generate_fallback_cards(subject: str, topic: str) -> list:
        return [
            {
                "front": f"What is the fundamental concept of {topic} in {subject}?",
                "back": f"{topic} involves applying core formulas and analytical reasoning.",
                "difficulty": "Medium",
                "mnemonic": "Remember: Understand concepts before memorizing formulas."
            },
            {
                "front": f"Define the primary formula or law associated with {topic}.",
                "back": f"Formulas in {topic} state relationships between key physical or mathematical variables.",
                "difficulty": "Easy",
                "mnemonic": "Hook: Check units carefully."
            },
            {
                "front": f"What common mistake should students avoid in {topic}?",
                "back": "Avoiding unit conversion errors and skipping step-by-step working.",
                "difficulty": "Hard",
                "mnemonic": "Tip: Always verify final calculation steps."
            },
            {
                "front": f"How does {topic} apply to real-world scenarios?",
                "back": f"Concepts in {topic} allow solving practical engineering and scientific challenges.",
                "difficulty": "Medium",
                "mnemonic": "Application: Connect theory to everyday phenomena."
            },
            {
                "front": f"Summary: How to revise {topic} effectively?",
                "back": "Use active recall with flashcards, attempt practice MCQs, and review weak topics.",
                "difficulty": "Easy",
                "mnemonic": "Strategy: Daily 15-minute spaced repetition."
            }
        ]
