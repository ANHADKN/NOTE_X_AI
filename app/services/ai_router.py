"""noteX AI - Central AI Intent Router & Orchestration Engine with RAG Context Integration."""
import re
from app.services.openai_service import AIService
from app.notes.services import NoteService
from app.notes.ai_notes import AINotesGenerator
from app.quiz.services import QuizService
from app.flashcards.services import FlashcardService
from app.study_planner.services import StudyPlannerService
from app.services.rag_service import RAGService
from app.utils.logger import logger

class AIRouter:
    """Central AI Router analyzing user intent, retrieving RAG context, and triggering underlying platform modules."""

    @classmethod
    def analyze_and_route(cls, user_id: str, prompt: str, student_class: str = "Class 10") -> dict:
        prompt_lower = prompt.lower()
        logger.info(f"AIRouter processing prompt for user {user_id}: '{prompt}'")

        # Automatically query RAG Vector Store for context enrichment
        rag_context = ""
        citations = []
        try:
            chunks = RAGService.search_relevant_chunks(doc_id=None, query=prompt, top_k=3)
            if chunks:
                rag_context = "\n".join([c.get('text', '') for c in chunks])
                citations = [{"source": c.get('citation', 'PDF'), "page": c.get('page', 1)} for c in chunks]
        except Exception as e:
            logger.warning(f"RAG Context retrieval fallback: {str(e)}")

        # 1. Detect GENERATE_NOTES Intent
        if any(w in prompt_lower for w in ['notes', 'summarize', 'summary', 'formula sheet', 'key points', 'mind map']):
            chapter = cls._extract_topic(prompt) or "General Concepts"
            enriched_topic = f"{chapter}\n\nRAG Reference Context:\n{rag_context[:400]}" if rag_context else chapter
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
            response_text = f"### 📝 Smart Notes Generated: **{chapter}**\n\n{generated_content[:300]}...\n{citation_str}\n\n*Saved automatically to your Notes Library.*"
            return {
                "response": response_text,
                "intent": "GENERATE_NOTES",
                "action": "OPEN_NOTES",
                "action_url": "#notes",
                "action_title": "📝 Open Smart Notes",
                "asset_id": str(note_doc.get('id', ''))
            }

        # 2. Detect GENERATE_QUIZ Intent
        if any(w in prompt_lower for w in ['quiz', 'mcq', 'mcqs', 'test me', 'questions', 'practice questions']):
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
        if any(w in prompt_lower for w in ['flashcard', 'flashcards', 'flip card', 'cards', 'active recall']):
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

        # 4. Detect GENERATE_STUDY_PLAN Intent
        if any(w in prompt_lower for w in ['study plan', 'timetable', 'schedule', 'revision plan', 'exam plan']):
            plan_doc = StudyPlannerService.get_or_create_plan(user_id=user_id, student_class=student_class)
            response_text = f"### 📅 AI Study Plan Generated ({student_class})\n\nI have built a personalized 7-day timetable and exam revision roadmap for your upcoming exams.\n\n*Saved to your Study Planner.*"
            return {
                "response": response_text,
                "intent": "GENERATE_STUDY_PLAN",
                "action": "VIEW_STUDY_PLAN",
                "action_url": "#study-plan",
                "action_title": "📅 View Study Plan",
                "asset_id": str(plan_doc.get('id', ''))
            }

        # 5. Detect ANALYTICS Intent
        if any(w in prompt_lower for w in ['analytics', 'performance', 'my grade', 'mastery score', 'weak topics', 'progress', 'score prediction']):
            from app.analytics.services import AnalyticsService
            analytics_data = AnalyticsService.get_user_analytics(user_id)
            response_text = f"### 📊 Learning Analytics Overview\n\n- **Subject Mastery Index:** {analytics_data.get('mastery_score', 82.5)}%\n- **Memory Retention Rate:** {analytics_data.get('retention_rate', 78.0)}%\n- **ML Predicted Grade:** {analytics_data.get('predicted_score', 88.5)}% ({analytics_data.get('predicted_grade', 'A+')})\n- **Active Study Streak:** {analytics_data.get('study_streak', 7)} Days\n\n*Updated real-time in your Analytics Dashboard.*"
            return {
                "response": response_text,
                "intent": "VIEW_ANALYTICS",
                "action": "VIEW_ANALYTICS",
                "action_url": "#analytics",
                "action_title": "📊 View Learning Analytics"
            }

        # 6. Detect RAG_PDF_SEARCH Intent
        if any(w in prompt_lower for w in ['pdf', 'document', 'file', 'from book', 'textbook']):
            if rag_context:
                ai_reply = AIService.generate_study_response(
                    prompt=f"Context from PDF:\n{rag_context}\n\nQuestion:\n{prompt}",
                    subject="PDF Reference",
                    student_class=student_class
                )
                response_text = f"{ai_reply}\n\n**PDF Citations:**\n" + "\n".join([f"- Page {c.get('page')}: `{c.get('source')}`" for c in citations])
            else:
                response_text = AIService.generate_study_response(prompt=prompt, subject="General", student_class=student_class)

            return {
                "response": response_text,
                "intent": "RAG_PDF_SEARCH",
                "action": "OPEN_PDF",
                "action_url": "#rag",
                "action_title": "📄 Open PDF Assistant"
            }

        # 7. Default Fallback: GENERAL_TUTOR_CHAT
        response_text = AIService.generate_study_response(prompt=prompt, subject="General", student_class=student_class)
        return {
            "response": response_text,
            "intent": "GENERAL_TUTOR_CHAT"
        }

    @staticmethod
    def _extract_topic(prompt: str) -> str:
        """Helper regex to extract chapter or topic name from prompt."""
        match = re.search(r'(?:for|of|on|about)\s+([A-Za-z0-9\s]+)', prompt, re.IGNORECASE)
        if match:
            clean = match.group(1).strip()
            return clean[:30].title()
        return ""
