"""noteX AI - Upgraded Central AI Intent Router & Modular Orchestration Engine."""
import re
from app.services.ai_service import AIService
from app.notes.services import NoteService
from app.notes.ai_notes import AINotesGenerator
from app.quiz.services import QuizService
from app.flashcards.services import FlashcardService
from app.study_planner.services import StudyPlannerService
from app.services.rag_service import RAGService
from app.utils.logger import logger

class AIRouter:
    """Upgraded Central AI Router automatically detecting user intent and routing to platform modules."""

    @classmethod
    def analyze_and_route(cls, user_id: str, prompt: str, student_class: str = "Class 10") -> dict:
        prompt_lower = prompt.lower().strip()
        logger.info(f"[AIRouter] Processing intent routing for user {user_id}: '{prompt}'")

        # Query RAG Vector Store for context enrichment
        rag_context = ""
        citations = []
        try:
            chunks = RAGService.search_relevant_chunks(doc_id=None, query=prompt, top_k=3)
            if chunks:
                rag_context = "\n".join([c.get('text', '') for c in chunks])
                citations = [{"source": c.get('citation', 'PDF'), "page": c.get('page', 1)} for c in chunks]
        except Exception as e:
            logger.warning(f"[AIRouter RAG Warning]: {str(e)}")

        # 1. Detect GENERATE_NOTES Intent
        if any(w in prompt_lower for w in ['generate note', 'notes', 'formula sheet', 'key points', 'mind map', 'cheatsheet', 'revision note']):
            chapter = cls._extract_topic(prompt) or "General Concepts"
            generated_content = AINotesGenerator.generate_note_content(
                subject="Science",
                chapter=chapter,
                note_type="Smart Notes",
                student_class=student_class
            )
            note_doc = NoteService.save_note(
                user_id=user_id,
                subject="Science",
                chapter=chapter,
                note_type="Smart Notes",
                content=generated_content,
                student_class=student_class
            )
            citation_str = f"\n\n**Source Citation:** `{citations[0]['source']} (Page {citations[0]['page']})`" if citations else ""
            response_text = f"### 📝 Smart Notes Generated: **{chapter}**\n\n{generated_content[:350]}...\n{citation_str}\n\n*Saved automatically to your Notes Library.*"
            return {
                "response": response_text,
                "intent": "GENERATE_NOTES",
                "action": "OPEN_NOTES",
                "action_url": "#notes",
                "action_title": "📝 Open Smart Notes",
                "asset_id": str(note_doc.get('id', ''))
            }

        # 2. Detect GENERATE_QUIZ Intent
        if any(w in prompt_lower for w in ['quiz', 'mcq', 'mcqs', 'test me', 'practice questions', 'mock test']):
            chapter = cls._extract_topic(prompt) or "Chapter Quiz"
            quiz_doc = QuizService.create_quiz(
                title=chapter,
                subject="Science",
                student_class=student_class,
                num_questions=5,
                quiz_type="mcq"
            )
            citation_str = f"\n\n**Source Citation:** `{citations[0]['source']} (Page {citations[0]['page']})`" if citations else ""
            response_text = f"### ❓ AI Quiz Generated: **{chapter}**\n\nI have generated a 5-question interactive quiz based on **{chapter}**.\n{citation_str}\n\n*Saved to your Quiz Library.*"
            return {
                "response": response_text,
                "intent": "GENERATE_QUIZ",
                "action": "START_QUIZ",
                "action_url": "#quizzes",
                "action_title": "❓ Start AI Quiz",
                "asset_id": str(quiz_doc.get('id', ''))
            }

        # 3. Detect GENERATE_FLASHCARDS Intent
        if any(w in prompt_lower for w in ['flashcard', 'flashcards', 'flip card', 'cards', 'active recall', 'mnemonic']):
            chapter = cls._extract_topic(prompt) or "Key Terminology"
            deck_doc = FlashcardService.generate_and_save_deck(
                user_id=user_id,
                subject="Science",
                topic=chapter,
                count=5,
                student_class=student_class
            )
            citation_str = f"\n\n**Source Citation:** `{citations[0]['source']} (Page {citations[0]['page']})`" if citations else ""
            response_text = f"### 🧠 Flashcard Deck Created: **{chapter}**\n\nI have created a 5-card active recall deck with memory mnemonics for **{chapter}**.\n{citation_str}\n\n*Saved to your Flashcards Library.*"
            return {
                "response": response_text,
                "intent": "GENERATE_FLASHCARDS",
                "action": "OPEN_FLASHCARDS",
                "action_url": "#flashcards",
                "action_title": "🧠 Open Flashcards",
                "asset_id": str(deck_doc.get('id', ''))
            }

        # 4. Detect STUDY_PLANNER Intent
        if any(w in prompt_lower for w in ['study plan', 'timetable', 'schedule', 'revision plan', 'exam plan', 'routine']):
            plan_doc = StudyPlannerService.get_or_create_plan(user_id=user_id, student_class=student_class)
            response_text = f"### 📅 AI Study Plan Generated ({student_class})\n\nI have built a personalized 7-day timetable and exam revision roadmap for your upcoming exams.\n\n*Saved to your Study Planner.*"
            return {
                "response": response_text,
                "intent": "STUDY_PLANNER",
                "action": "VIEW_STUDY_PLAN",
                "action_url": "#study-plan",
                "action_title": "📅 View Study Plan",
                "asset_id": str(plan_doc.get('id', ''))
            }

        # 5. Detect SUMMARIZE_PDF / RAG Intent
        if any(w in prompt_lower for w in ['pdf', 'document', 'file', 'from book', 'textbook', 'summarize pdf', 'extract from pdf']):
            if rag_context:
                ai_reply = AIService.generate_study_response(
                    prompt=f"Context from PDF:\n{rag_context}\n\nQuestion:\n{prompt}",
                    subject="PDF Reference",
                    student_class=student_class
                )
                response_text = f"{ai_reply}\n\n**PDF Citations:**\n" + "\n".join([f"- Page {c.get('page')}: `{c.get('source')}`" for c in citations])
            else:
                response_text = AIService.generate_study_response(prompt=prompt, subject="PDF RAG", student_class=student_class)

            return {
                "response": response_text,
                "intent": "SUMMARIZE_PDF",
                "action": "OPEN_PDF",
                "action_url": "#rag",
                "action_title": "📄 Open PDF Assistant"
            }

        # 6. Detect TRANSLATE Intent
        if any(w in prompt_lower for w in ['translate', 'translation', 'in hindi', 'in malayalam', 'in spanish', 'convert to english', 'translate to']):
            response_text = AIService.generate_study_response(
                prompt=f"Please translate and explain the following into simple terms:\n\n{prompt}",
                subject="Language Translation",
                student_class=student_class
            )
            return {
                "response": response_text,
                "intent": "TRANSLATE",
                "action": "OPEN_CHAT",
                "action_url": "#chat",
                "action_title": "🌐 Language Translation"
            }

        # 7. Detect MATHEMATICS Intent
        if any(w in prompt_lower for w in ['math', 'mathematics', 'algebra', 'geometry', 'calculus', 'trigonometry', 'quadratic', 'pythagoras', 'ap series', 'equation', 'matrix', 'derivative', 'integration']):
            response_text = AIService.generate_study_response(prompt=prompt, subject="Mathematics", student_class=student_class)
            return {
                "response": response_text,
                "intent": "MATHEMATICS",
                "action": "OPEN_CHAT",
                "action_url": "#chat",
                "action_title": "📐 Mathematics Tutor"
            }

        # 8. Detect PHYSICS Intent
        if any(w in prompt_lower for w in ['physics', 'optics', 'light', 'snell', 'electricity', 'ohm', 'voltage', 'resistor', 'force', 'motion', 'newton', 'thermodynamics', 'gravity']):
            response_text = AIService.generate_study_response(prompt=prompt, subject="Physics", student_class=student_class)
            return {
                "response": response_text,
                "intent": "PHYSICS",
                "action": "OPEN_CHAT",
                "action_url": "#chat",
                "action_title": "⚡ Physics Tutor"
            }

        # 9. Detect CHEMISTRY Intent
        if any(w in prompt_lower for w in ['chemistry', 'chemical', 'redox', 'acid', 'base', 'ph', 'periodic table', 'valency', 'molecule', 'atom', 'organic chemistry', 'reaction']):
            response_text = AIService.generate_study_response(prompt=prompt, subject="Chemistry", student_class=student_class)
            return {
                "response": response_text,
                "intent": "CHEMISTRY",
                "action": "OPEN_CHAT",
                "action_url": "#chat",
                "action_title": "🧪 Chemistry Tutor"
            }

        # 10. Detect BIOLOGY Intent
        if any(w in prompt_lower for w in ['biology', 'photosynthesis', 'cell', 'organ', 'digestive', 'respiration', 'heart', 'dna', 'genetics', 'enzyme', 'plant', 'chlorophyll']):
            response_text = AIService.generate_study_response(prompt=prompt, subject="Biology", student_class=student_class)
            return {
                "response": response_text,
                "intent": "BIOLOGY",
                "action": "OPEN_CHAT",
                "action_url": "#chat",
                "action_title": "🧬 Biology Tutor"
            }

        # 11. Detect PROGRAMMING Intent
        if any(w in prompt_lower for w in ['programming', 'code', 'python', 'javascript', 'html', 'css', 'algorithm', 'function', 'loop', 'array', 'sql', 'database', 'bug', 'debug']):
            response_text = AIService.generate_study_response(prompt=prompt, subject="Programming & Computer Science", student_class=student_class)
            return {
                "response": response_text,
                "intent": "PROGRAMMING",
                "action": "OPEN_CHAT",
                "action_url": "#chat",
                "action_title": "💻 Programming Assistant"
            }

        # 12. Detect EXPLAIN_CONCEPT Intent
        if any(w in prompt_lower for w in ['explain', 'what is', 'how does', 'describe', 'definition of', 'concept of', 'tell me about']):
            response_text = AIService.generate_study_response(prompt=prompt, subject="Concept Explanation", student_class=student_class)
            return {
                "response": response_text,
                "intent": "EXPLAIN_CONCEPT",
                "action": "OPEN_CHAT",
                "action_url": "#chat",
                "action_title": "💡 Concept Explanation"
            }

        # 13. Default Fallback Intent
        response_text = AIService.generate_study_response(prompt=prompt, subject="General Study", student_class=student_class)
        return {
            "response": response_text,
            "intent": "GENERAL_TUTOR_CHAT",
            "action": "OPEN_CHAT",
            "action_url": "#chat",
            "action_title": "💬 AI General Tutor"
        }

    @staticmethod
    def _extract_topic(prompt: str) -> str:
        """Helper regex to extract chapter or topic name from prompt."""
        match = re.search(r'(?:for|of|on|about)\s+([A-Za-z0-9\s]+)', prompt, re.IGNORECASE)
        if match:
            clean = match.group(1).strip()
            return clean[:30].title()
        return ""
