from app.services.ai_service import AIService
from app.services.rag_service import RAGService
from app.utils.logger import logger

class AINotesGenerator:
    """AI Engine for generating structured educational study notes."""

    NOTE_TYPE_PROMPTS = {
        "Smart Notes": "Generate comprehensive Smart Study Notes with clear headings, bullet points, real-world examples, and key concepts.",
        "Smart Summary": "Generate a clean Smart Study Summary with key headings, bullet points, and essential takeaways.",
        "Short Notes": "Generate concise 1-page Short Study Notes focusing on quick definitions and core principles.",
        "Key Notes": "Generate Key Notes highlighting important terms, key takeaways, and essential formulas.",
        "Revision Notes": "Generate an Exam Revision Sheet structured for rapid revision before exams.",
        "Formula Sheet": "Generate a dedicated Formula Sheet with all key mathematical and scientific formulas, units, variable definitions, and equations using standard LaTeX ($...$ for inline, $$...$$ for display blocks).",
        "Formula Notes": "Generate a dedicated Formula Sheet with all key formulas and equations using standard LaTeX notation.",
        "One-Page Summary": "Generate a 1-Page Chapter Summary summarizing the entire topic in under 400 words.",
        "Exam Notes": "Generate High-Yield Exam Notes with top 5 expected exam questions and step-by-step model answers.",
        "Key Concepts": "Generate Key Concepts & Definitions with clear explanations and examples."
    }

    @classmethod
    def generate_note_content(cls, subject: str, chapter: str, note_type: str = "Smart Notes", student_class: str = "Class 10") -> str:
        """Generates AI notes strictly adhering to requested subject, topic, and format."""
        type_instruction = cls.NOTE_TYPE_PROMPTS.get(note_type, cls.NOTE_TYPE_PROMPTS["Smart Notes"])
        
        prompt = (
            f"STRICT SUBJECT BOUNDARY REQUIREMENT:\n"
            f"Target Subject: '{subject}' ONLY.\n"
            f"Topic/Chapter: '{chapter}'\n"
            f"Target Grade Level: '{student_class}'\n"
            f"Note Format Requested: '{note_type}'\n\n"
            f"INSTRUCTIONS:\n"
            f"1. Generate detailed, highly accurate study content strictly belonging to {subject} on topic '{chapter}'. Do NOT mix or mention any other subjects.\n"
            f"2. {type_instruction}\n"
            f"3. Use clean GitHub-Flavored Markdown with headings (###), bold key terms, bullet points, and code blocks where applicable.\n"
            f"4. For mathematical or scientific formulas, write ALL equations in KaTeX LaTeX notation ($...$ for inline, $$...$$ for display blocks).\n"
        )

        logger.info(f"[AINotesGenerator] Generating '{note_type}' for Subject: '{subject}' | Chapter: '{chapter}' | Grade: '{student_class}'")

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
