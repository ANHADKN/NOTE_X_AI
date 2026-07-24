# Changelog

All notable changes to **noteX AI** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [4.0.0] - 2026-07-24 (Production Release)

### Added
- **Central AI Intent Router (`ai_router.py`)**: Automatic intent detection (`GENERATE_NOTES`, `GENERATE_QUIZ`, `GENERATE_FLASHCARDS`, `GENERATE_STUDY_PLAN`, `VIEW_ANALYTICS`, `RAG_PDF_SEARCH`) with RAG context enrichment and interactive action buttons.
- **Unified "My Library" (`app/library/`)**: Single repository aggregating PDFs, AI Notes, Flashcard Decks, Quizzes, Study Plans, and Chat History with live search, category tab filters, preview modal, title renaming, and deletion.
- **AI Overview Dashboard (`app/dashboard/`)**: Redesigned dashboard featuring Today's Goal, Study Streak, Learning Progress (%), Continue Learning, Recent Chats, Recent PDFs, AI Suggestions, and Weak Topics Priority.
- **Production DevOps Stack**: Multi-stage `Dockerfile`, `docker-compose.yml` (Flask + MongoDB 6.0 + Nginx reverse proxy), `gunicorn.conf.py` WSGI server configuration, and `/api/health` healthcheck endpoint.
- **Automated Verification**: Added `scratch/test_all_modules.py` master test suite verifying all 14 integration test modules.

### Security
- **File Upload Security (`app/utils/pdf_processor.py`)**: Implemented `PDFProcessor.validate_pdf_file()` enforcing `secure_filename`, verifying `%PDF-` magic header signatures, restricting file extensions to `.pdf`, and capping upload sizes at 16 MB.
- **RBAC Authorization**: Enforced `role == 'admin'` validation on all `/api/admin/*` routes.
- **Database Optimization**: Created compound indexes on MongoDB collections.
