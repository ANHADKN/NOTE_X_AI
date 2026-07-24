import json
from app.services.openai_service import AIService
from app.utils.logger import logger

class AIQuizGenerator:
    """AI Question Generator for MCQs, 1-Mark, 2-Mark, 5-Mark, and HOTS Questions."""

    @classmethod
    def generate_quiz_questions(cls, subject: str, chapter: str, num_questions: int = 5, question_type: str = "mcq", student_class: str = "Class 10") -> list:
        """Generates structured question set tailored for Class 1 to Class 12."""
        prompt = (
            f"Generate a quiz with {num_questions} questions for {student_class} student.\n"
            f"Subject: '{subject}', Chapter/Topic: '{chapter}', Question Type: '{question_type}'.\n\n"
            f"Return a strict JSON list of question objects with format:\n"
            f"[\n"
            f"  {{\n"
            f"    \"id\": 1,\n"
            f"    \"question\": \"Question text here\",\n"
            f"    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
            f"    \"correct_index\": 0,\n"
            f"    \"explanation\": \"Detailed AI explanation of why this answer is correct.\",\n"
            f"    \"marks\": 1\n"
            f"  }}\n"
            f"]"
        )

        try:
            raw_response = AIService.generate_chat_response(prompt, student_class, subject)
            # Find JSON array in response
            start_idx = raw_response.find('[')
            end_idx = raw_response.rfind(']') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = raw_response[start_idx:end_idx]
                return json.loads(json_str)
        except Exception as e:
            logger.warning(f"JSON parsing error for quiz: {str(e)}. Using fallback questions generator.")

        # Fallback question set
        return cls._generate_fallback_questions(subject, chapter, student_class)

    @staticmethod
    def _generate_fallback_questions(subject: str, chapter: str, student_class: str) -> list:
        return [
            {
                "id": 1,
                "question": f"What is the primary unit of study in {subject} ({chapter})?",
                "options": ["SI Unit / Core Principle", "Mass Energy Equivalence", "Standard Deviation", "Atmospheric Pressure"],
                "correct_index": 0,
                "explanation": f"In {subject}, core principles define foundational measurements and concepts.",
                "marks": 1
            },
            {
                "id": 2,
                "question": f"Which law or theorem governs basic problem solving in {chapter}?",
                "options": ["Conservation Law / Formula", "Boyles Law", "Quantum Mechanics", "Pythagoras Theorem"],
                "correct_index": 0,
                "explanation": "Conservation principles and mathematical formulas form the basis for problem solving.",
                "marks": 1
            },
            {
                "id": 3,
                "question": f"What is a key application of {chapter} for {student_class} students?",
                "options": ["Real-world Problem Solving", "Astrophysics Simulation", "Stellar Evolution", "Data Mining"],
                "correct_index": 0,
                "explanation": f"Students in {student_class} apply these concepts to real-world analytical tasks.",
                "marks": 1
            },
            {
                "id": 4,
                "question": f"Which statement best summarizes {chapter}?",
                "options": ["Core concept requires step-by-step formula application", "All variables remain static", "Energy cannot be measured", "No mathematical relationship exists"],
                "correct_index": 0,
                "explanation": "Systematic step-by-step application ensures accurate solutions.",
                "marks": 1
            },
            {
                "id": 5,
                "question": f"What is the recommended approach for revision in {subject}?",
                "options": ["Practice chapter questions & review AI explanations", "Ignore weak topics", "Rely on guesswork", "Memorize without understanding"],
                "correct_index": 0,
                "explanation": "Active recall and practicing questions with AI explanations maximizes retention.",
                "marks": 1
            }
        ]
