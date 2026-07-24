from app.services.openai_service import AIService
from app.services.rag_service import RAGService
from app.utils.logger import logger

class AINotesGenerator:
    """AI Engine for generating and summarizing educational study notes."""

    NOTE_TYPE_PROMPTS = {
        "Smart Notes": "Generate comprehensive Smart Study Notes with clear headings, bullet points, real-world examples, and key concepts.",
        "Short Notes": "Generate concise 1-page Short Study Notes focusing on quick definitions and core principles.",
        "Key Notes": "Generate Key Notes highlighting important terms, key takeaways, and essential formulas.",
        "Revision Notes": "Generate an Exam Revision Sheet structured for rapid revision before exams.",
        "Formula Notes": "Generate a dedicated Formula Sheet with all key mathematical and scientific formulas, units, and variable definitions.",
        "One-Page Summary": "Generate a 1-Page Chapter Summary summarizing the entire topic in under 400 words.",
        "Exam Notes": "Generate High-Yield Exam Notes with top 5 expected exam questions and step-by-step model answers.",
        "Last-Minute Revision": "Generate Last-Minute Flash Revision Points to memorize 30 minutes before entering the exam hall."
    }

    @classmethod
    def generate_note_content(cls, subject: str, chapter: str, note_type: str = "Smart Notes", student_class: str = "Class 10") -> str:
        """Generates AI notes based on note format, subject, chapter, and class level."""
        type_instruction = cls.NOTE_TYPE_PROMPTS.get(note_type, cls.NOTE_TYPE_PROMPTS["Smart Notes"])
        
        prompt = (
            f"Topic/Chapter: '{chapter}'\n"
            f"Subject: '{subject}'\n"
            f"Class/Grade: '{student_class}'\n\n"
            f"Instruction: {type_instruction}\n"
            f"Ensure formatting uses clean Markdown headings (###), bullet points, and bold text."
        )

        return AIService.generate_chat_response(
            user_prompt=prompt,
            student_class=student_class,
            subject=subject
        )

    @classmethod
    def summarize_context(cls, text_content: str, doc_id: str = None, student_class: str = "Class 10") -> str:
        """Summarizes uploaded text content or PDF RAG context."""
        context_str = text_content
        if doc_id:
            chunks = RAGService.search_relevant_chunks(doc_id, "summary overview key points", top_k=5)
            if chunks:
                context_str = "\n\n".join([c["text"] for c in chunks])

        prompt = (
            f"Summarize the following study material into a structured 1-page revision summary tailored for a {student_class} student:\n\n"
            f"{context_str[:2500]}"
        )

        return AIService.generate_chat_response(
            user_prompt=prompt,
            student_class=student_class,
            subject="General"
        )
