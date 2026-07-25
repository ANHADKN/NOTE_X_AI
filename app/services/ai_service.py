"""noteX AI - Reusable AI Service & Provider Engine supporting Groq API, OpenAI, and Fallbacks."""
import os
import json
import time
import urllib.request
from abc import ABC, abstractmethod

from app.config import Config
from app.utils.logger import logger


class BaseAIProvider(ABC):
    """Abstract Base Class for modular AI Providers (Groq, OpenAI, Anthropic, etc.)."""

    @abstractmethod
    def generate_completion(self, messages: list, model: str, temperature: float = 0.7, max_tokens: int = 1024) -> str:
        """Generate full completion text for a list of conversation messages."""
        pass

    @abstractmethod
    def stream_completion(self, messages: list, model: str, temperature: float = 0.7, max_tokens: int = 1024):
        """Stream chunks of completion text for real-time typing UI."""
        pass


class GroqProvider(BaseAIProvider):
    """Groq Llama-3 API Integration Provider."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_completion(self, messages: list, model: str, temperature: float = 0.7, max_tokens: int = 1024) -> str:
        start_time = time.time()
        logger.info(f"[Groq API Request] Provider: Groq | Model: {model} | Messages Count: {len(messages)} | Temp: {temperature}")

        # 1. Try Official Groq SDK
        try:
            from groq import Groq
            client = Groq(api_key=self.api_key)
            completion = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            response_text = completion.choices[0].message.content
            latency = time.time() - start_time
            
            # Log Response telemetry
            usage_info = getattr(completion, 'usage', None)
            tokens_str = f"Tokens: {usage_info.total_tokens}" if usage_info else "Tokens: N/A"
            logger.info(f"[Groq API Response] Status: SUCCESS | Latency: {latency:.2f}s | Output Length: {len(response_text)} chars | {tokens_str}")
            return response_text

        except Exception as sdk_err:
            logger.warning(f"[Groq SDK Info] Falling back to direct HTTP API: {str(sdk_err)}")

        # 2. Direct HTTP Fallback to Groq API endpoint
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            req_data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "noteX-AI/1.0"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=30) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                response_text = res_data['choices'][0]['message']['content']
                latency = time.time() - start_time
                logger.info(f"[Groq HTTP Response] Status: SUCCESS | Latency: {latency:.2f}s | Output Length: {len(response_text)} chars")
                return response_text

        except Exception as http_err:
            latency = time.time() - start_time
            logger.error(f"[Groq API Error] Request failed after {latency:.2f}s: {str(http_err)}")
            raise http_err

    def stream_completion(self, messages: list, model: str, temperature: float = 0.7, max_tokens: int = 1024):
        """Stream chunks from Groq API."""
        full_text = self.generate_completion(messages, model, temperature, max_tokens)
        words = full_text.split(' ')
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield chunk
            time.sleep(0.03)


class OpenAIProvider(BaseAIProvider):
    """OpenAI GPT API Integration Provider."""

    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_completion(self, messages: list, model: str = "gpt-4o-mini", temperature: float = 0.7, max_tokens: int = 1024) -> str:
        start_time = time.time()
        logger.info(f"[OpenAI API Request] Model: {model} | Messages Count: {len(messages)}")

        import openai
        client = openai.OpenAI(api_key=self.api_key)
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        response_text = completion.choices[0].message.content
        latency = time.time() - start_time
        logger.info(f"[OpenAI API Response] Status: SUCCESS | Latency: {latency:.2f}s | Output Length: {len(response_text)} chars")
        return response_text

    def stream_completion(self, messages: list, model: str = "gpt-4o-mini", temperature: float = 0.7, max_tokens: int = 1024):
        full_text = self.generate_completion(messages, model, temperature, max_tokens)
        words = full_text.split(' ')
        for i, word in enumerate(words):
            yield word + (" " if i < len(words) - 1 else "")
            time.sleep(0.03)


class MockFallbackProvider(BaseAIProvider):
    """Fallback Provider generating structured educational Markdown responses when no API keys are configured."""

    def generate_completion(self, messages: list, model: str = "mock", temperature: float = 0.7, max_tokens: int = 1024) -> str:
        last_user_msg = "General Topic"
        for m in reversed(messages):
            if m.get('role') == 'user':
                last_user_msg = m.get('content', '')
                break

        logger.info(f"[Mock Fallback Response] Generating local educational Markdown for prompt: '{last_user_msg[:50]}'")
        prompt_lower = last_user_msg.lower()

        if "photosynthesis" in prompt_lower or "biology" in prompt_lower:
            return (
                "### 🌱 Understanding Photosynthesis\n\n"
                "**Photosynthesis** is the chemical process by which green plants convert solar energy into chemical energy stored as glucose.\n\n"
                "#### Chemical Equation:\n"
                "$$\\text{6CO}_2 + \\text{6H}_2\\text{O} \\xrightarrow{\\text{Sunlight, Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{6O}_2$$\n\n"
                "#### Core Phases:\n"
                "1. **Light-Dependent Reaction**: Occurs in thylakoid membranes where solar energy splits water ($H_2O$) releasing $O_2$.\n"
                "2. **Light-Independent Reaction (Calvin Cycle)**: Occurs in stroma where $CO_2$ is fixed into Glucose ($C_6H_{12}O_6$).\n\n"
                "💡 *Concept Check*: Would you like to practice a sample 2-mark question on Photosynthesis?"
            )
        elif "math" in prompt_lower or "equation" in prompt_lower or "formula" in prompt_lower:
            return (
                "### 📐 Quadratic Formula & Roots\n\n"
                "For any standard quadratic equation $ax^2 + bx + c = 0$ ($a \\neq 0$):\n\n"
                "$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n"
                "#### Discriminant ($D = b^2 - 4ac$):\n"
                "- **$D > 0$**: Two distinct real roots.\n"
                "- **$D = 0$**: Two equal real roots ($x = -b/2a$).\n"
                "- **$D < 0$**: No real roots.\n\n"
                "Would you like a step-by-step example problem solved for your grade level?"
            )
        else:
            return (
                f"### 📚 noteX AI Study Assistant\n\n"
                f"Here is the structured breakdown for **\"{last_user_msg[:60]}\"**:\n\n"
                f"- **Core Definition**: Fundamental principles tailored for academic excellence.\n"
                f"- **Key Formula / Concept**: Always break complex problems into sequential steps.\n"
                f"- **Exam Tip**: Focus on key terms, definitions, and proper units.\n\n"
                f"How else can I assist you with this topic today?"
            )

    def stream_completion(self, messages: list, model: str = "mock", temperature: float = 0.7, max_tokens: int = 1024):
        text = self.generate_completion(messages, model, temperature, max_tokens)
        for chunk in text.split(' '):
            yield chunk + " "
            time.sleep(0.03)


class AIProviderFactory:
    """Factory creating and resolving active AI Provider instance based on configuration."""

    @staticmethod
    def get_provider() -> tuple[BaseAIProvider, str]:
        groq_key = Config.GROQ_API_KEY or os.getenv('GROQ_API_KEY', '')
        model_name = Config.MODEL_NAME or os.getenv('MODEL_NAME', 'llama-3.3-70b-versatile')
        openai_key = Config.OPENAI_API_KEY or os.getenv('OPENAI_API_KEY', '')

        # Check Groq Key validity
        if groq_key and not groq_key.startswith('gsk_your') and groq_key != 'mock_key_for_dev_mode':
            return GroqProvider(groq_key), model_name

        # Check OpenAI Key validity fallback
        if openai_key and not openai_key.startswith('sk-proj-your') and openai_key != 'mock_key_for_dev_mode':
            return OpenAIProvider(openai_key), "gpt-4o-mini"

        # Fallback to local Mock Provider
        logger.info("[AIProviderFactory] No valid Groq or OpenAI key found. Using MockFallbackProvider.")
        return MockFallbackProvider(), "mock-educational"


class AIService:
    """Central Reusable AI Service class for noteX AI Platform."""

    @staticmethod
    def _build_system_prompt(student_class: str = "Class 10", subject: str = "General") -> str:
        return (
            f"You are noteX AI, an encouraging, patient, and highly intelligent AI tutor specializing in Indian school curriculum (CBSE, ICSE, State Boards).\n"
            f"Target Student Grade: {student_class}\n"
            f"Current Subject Context: {subject}\n\n"
            f"CRITICAL GUIDELINES:\n"
            f"1. Tailor explanations, vocabulary, and examples strictly to a {student_class} student's comprehension level.\n"
            f"2. Always format your responses in clean, structured GitHub-Flavored Markdown with headings (###), bullet points, and bold text for readability.\n"
            f"3. For Math or Science, provide step-by-step solutions with clear formula explanations using standard LaTeX notation ($...$ for inline, $$...$$ for blocks).\n"
            f"4. Be interactive: end responses with a gentle follow-up question or concept check to test comprehension.\n"
            f"5. Maintain a supportive, enthusiastic tone."
        )

    @classmethod
    def generate_chat_response(cls, user_prompt: str, student_class: str = "Class 10", subject: str = "General", history: list = None) -> str:
        """Generates AI response using active AI Provider (Groq API by default)."""
        messages = [{"role": "system", "content": cls._build_system_prompt(student_class, subject)}]

        if history:
            for h in history[-6:]:
                if isinstance(h, dict):
                    if h.get('prompt'):
                        messages.append({"role": "user", "content": h['prompt']})
                    if h.get('response'):
                        messages.append({"role": "assistant", "content": h['response']})

        messages.append({"role": "user", "content": user_prompt})

        provider, model_name = AIProviderFactory.get_provider()

        try:
            return provider.generate_completion(messages=messages, model=model_name, temperature=0.7, max_tokens=1200)
        except Exception as e:
            logger.error(f"[AIService Error] Provider {provider.__class__.__name__} failed: {str(e)}. Falling back to local MockProvider.")
            fallback = MockFallbackProvider()
            return fallback.generate_completion(messages=messages, model="mock")

    @classmethod
    def generate_study_response(cls, prompt: str, subject: str = "General", student_class: str = "Class 10") -> str:
        """Alias method for study query responses."""
        return cls.generate_chat_response(user_prompt=prompt, student_class=student_class, subject=subject)

    @classmethod
    def stream_chat_response(cls, user_prompt: str, student_class: str = "Class 10", subject: str = "General", history: list = None):
        """Streams SSE chunked response text for real-time live typing on frontend."""
        messages = [{"role": "system", "content": cls._build_system_prompt(student_class, subject)}]

        if history:
            for h in history[-6:]:
                if isinstance(h, dict):
                    u_msg = h.get('user_message') or h.get('prompt')
                    a_msg = h.get('ai_response') or h.get('response')
                    if u_msg:
                        messages.append({"role": "user", "content": u_msg})
                    if a_msg:
                        messages.append({"role": "assistant", "content": a_msg})

        messages.append({"role": "user", "content": user_prompt})

        provider, model_name = AIProviderFactory.get_provider()

        try:
            for chunk in provider.stream_completion(messages=messages, model=model_name, temperature=0.7, max_tokens=1200):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        except Exception as e:
            logger.error(f"[AIService Streaming Error]: {str(e)}")
            yield f"data: {json.dumps({'chunk': ' An error occurred while generating response.'})}\n\n"
        yield "data: [DONE]\n\n"
