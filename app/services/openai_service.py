import os
import json
import time
from app.config import Config
from app.utils.logger import logger

class AIService:
    """OpenAI API Integration & Educational Prompt Engine for noteX AI."""

    @staticmethod
    def _build_system_prompt(student_class: str = "Class 10", subject: str = "General") -> str:
        """Constructs grade-adapted system instructions for Class 1 to Class 12 students."""
        return (
            f"You are noteX AI, an encouraging, patient, and highly intelligent AI tutor specializing in Indian school curriculum (CBSE, ICSE, State Boards).\n"
            f"Target Student Grade: {student_class}\n"
            f"Current Subject Context: {subject}\n\n"
            f"Guidelines:\n"
            f"1. Tailor your explanations, vocabulary, and examples strictly to a {student_class} student's level.\n"
            f"2. Use clear formatting with Markdown headings, bullet points, and bold text for readability.\n"
            f"3. For Math or Science, provide step-by-step solutions with clear formula explanations.\n"
            f"4. Be interactive: end responses with a gentle follow-up question to test comprehension.\n"
            f"5. Maintain a supportive, enthusiastic tone."
        )

    @classmethod
    def generate_study_response(cls, prompt: str, subject: str = "General", student_class: str = "Class 10") -> str:
        """Alias for generate_chat_response for AI Router study queries."""
        return cls.generate_chat_response(user_prompt=prompt, student_class=student_class, subject=subject)

    @classmethod
    def generate_chat_response(cls, user_prompt: str, student_class: str = "Class 10", subject: str = "General", history: list = None) -> str:
        """Generates AI response using OpenAI API or smart mock fallback for dev testing."""
        api_key = Config.OPENAI_API_KEY

        # Fallback response engine for local dev testing without active paid API key
        if not api_key or api_key == "mock_key_for_dev_mode" or api_key == "your_openai_api_key_here":
            return cls._generate_mock_educational_response(user_prompt, student_class, subject)

        try:
            import openai
            openai.api_key = api_key
            
            messages = [{"role": "system", "content": cls._build_system_prompt(student_class, subject)}]
            
            # Add past context if present
            if history:
                for h in history[-6:]:
                    messages.append({"role": "user", "content": h.get('prompt', '')})
                    messages.append({"role": "assistant", "content": h.get('response', '')})
            
            messages.append({"role": "user", "content": user_prompt})

            client = openai.OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )

            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI API Error: {str(e)}. Falling back to local educational responder.")
            return cls._generate_mock_educational_response(user_prompt, student_class, subject)

    @classmethod
    def stream_chat_response(cls, user_prompt: str, student_class: str = "Class 10", subject: str = "General"):
        """Streams chunked response text for real-time live typing effect."""
        full_text = cls.generate_chat_response(user_prompt, student_class, subject)
        words = full_text.split(' ')
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            time.sleep(0.04)
        yield "data: [DONE]\n\n"

    @staticmethod
    def _generate_mock_educational_response(prompt: str, student_class: str, subject: str) -> str:
        """Generates grade-appropriate Markdown response for local development."""
        prompt_lower = prompt.lower()
        
        if "photosynthesis" in prompt_lower or "biology" in prompt_lower or "science" in prompt_lower:
            return (
                f"### 🌱 Understanding Photosynthesis ({student_class})\n\n"
                f"**Photosynthesis** is the process by which green plants manufacture their own food using sunlight, water, and carbon dioxide.\n\n"
                f"#### Key Chemical Formula:\n"
                f"$$\\text{{6CO}}_2 + \\text{{6H}}_2\\text{{O}} \\xrightarrow{{\\text{{Sunlight, Chlorophyll}}}} \\text{{C}}_6\\text{{H}}_{{12}}\\text{{O}}_6 + \\text{{6O}}_2$$\n\n"
                f"#### Core Steps:\n"
                f"1. **Absorption of Light**: Chlorophyll in leaves traps solar energy.\n"
                f"2. **Water Absorption**: Roots draw water ($H_2O$) from soil.\n"
                f"3. **Glucose Production**: Plants convert $CO_2$ and $H_2O$ into Glucose ($C_6H_{{12}}O_6$) and release Oxygen ($O_2$).\n\n"
                f"💡 *Concept Check*: Would you like to try a 2-minute quiz on photosynthesis to test your knowledge?"
            )
        elif "math" in prompt_lower or "pythagoras" in prompt_lower or "equation" in prompt_lower:
            return (
                f"### 📐 Pythagoras Theorem ({student_class})\n\n"
                f"In any **Right-Angled Triangle**, the square of the hypotenuse ($c$) equals the sum of squares of the other two sides ($a$ and $b$).\n\n"
                f"$$\\mathbf{{a^2 + b^2 = c^2}}$$\n\n"
                f"#### Example Problem:\n"
                f"- Side $a = 3\\text{{ cm}}$, Side $b = 4\\text{{ cm}}$\n"
                f"- $c^2 = 3^2 + 4^2 = 9 + 16 = 25$\n"
                f"- $c = \\sqrt{{25}} = 5\\text{{ cm}}$\n\n"
                f"Would you like another practice problem for {student_class} level?"
            )
        else:
            return (
                f"### 📚 noteX AI Tutor Response ({student_class} - {subject})\n\n"
                f"Great question about **\"{prompt}\"**!\n\n"
                f"Here is a structured explanation tailored for **{student_class}**:\n\n"
                f"- **Core Concept**: Every topic starts with understanding the basic principles.\n"
                f"- **Real-World Application**: Understanding this helps in exams and practical problem solving.\n"
                f"- **Key Takeaway**: Focus on core definitions and practice sample questions.\n\n"
                f"What specific part of this topic would you like me to clarify further?"
            )
