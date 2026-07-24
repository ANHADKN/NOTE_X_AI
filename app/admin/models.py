import datetime

class AdminSettingsModel:
    """MongoDB Schema for Admin System Settings & Config."""

    @staticmethod
    def create_settings_doc(
        active_llm_model: str = "gpt-4o-mini",
        embedding_model: str = "all-MiniLM-L6-v2",
        max_pdf_upload_mb: int = 16,
        maintenance_mode: bool = False
    ) -> dict:
        return {
            "active_llm_model": active_llm_model,
            "embedding_model": embedding_model,
            "max_pdf_upload_mb": max_pdf_upload_mb,
            "maintenance_mode": maintenance_mode,
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
