"""noteX AI - Root Level Reusable AI Service Module Re-export."""
from app.services.ai_service import AIService, GroqProvider, OpenAIProvider, MockFallbackProvider, AIProviderFactory

__all__ = ['AIService', 'GroqProvider', 'OpenAIProvider', 'MockFallbackProvider', 'AIProviderFactory']
