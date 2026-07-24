from flask import Blueprint, request
from app.utils.auth import token_required
from app.utils.response import api_response
from app.notes.ai_notes import AINotesGenerator
from app.notes.services import NoteService
from app.utils.logger import logger

notes_bp = Blueprint('notes_bp', __name__, url_prefix='/api/notes')

@notes_bp.route('/generate', methods=['POST'])
@token_required
def generate_note():
    """Generate AI Smart Notes, Short Notes, Key Notes, Formulas, etc."""
    try:
        data = request.get_json() or {}
        subject = data.get('subject', 'Science').strip()
        chapter = data.get('chapter', '').strip() or data.get('topic', '').strip()
        note_type = data.get('note_type', 'Smart Notes').strip()

        if not chapter:
            return api_response(success=False, message="Chapter/Topic name is required.", status_code=400)

        user_info = request.user
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')

        # 1. Generate note content via AI
        content = AINotesGenerator.generate_note_content(
            subject=subject,
            chapter=chapter,
            note_type=note_type,
            student_class=student_class
        )

        # 2. Save note in MongoDB
        saved_note = NoteService.save_note(
            user_id=user_id,
            subject=subject,
            chapter=chapter,
            note_type=note_type,
            content=content,
            student_class=student_class
        )

        return api_response(
            success=True,
            message=f"{note_type} generated successfully for {chapter}!",
            data={"note": saved_note},
            status_code=201
        )
    except Exception as e:
        logger.error(f"Generate Note Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@notes_bp.route('/summarize', methods=['POST'])
@token_required
def summarize_text():
    """Summarizes uploaded text content or PDF context into 1-page notes."""
    try:
        data = request.get_json() or {}
        text_content = data.get('text_content', '').strip()
        doc_id = data.get('doc_id')

        if not text_content and not doc_id:
            return api_response(success=False, message="text_content or doc_id is required.", status_code=400)

        user_info = request.user
        student_class = user_info.get('student_class', 'Class 10')

        summary = AINotesGenerator.summarize_context(
            text_content=text_content,
            doc_id=doc_id,
            student_class=student_class
        )

        return api_response(success=True, data={"summary": summary}, status_code=200)
    except Exception as e:
        logger.error(f"Summarize Note Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@notes_bp.route('/list', methods=['GET'])
@token_required
def list_notes():
    """List saved notes for current student session."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        subject = request.args.get('subject')
        note_type = request.args.get('note_type')

        notes = NoteService.get_user_notes(user_id=user_id, subject=subject, note_type=note_type)
        return api_response(success=True, data={"notes": notes}, status_code=200)
    except Exception as e:
        logger.error(f"List Notes Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@notes_bp.route('/<note_id>', methods=['GET'])
@token_required
def get_note(note_id):
    """Retrieve single note detail."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')

        note = NoteService.get_note_by_id(user_id, note_id)
        if not note:
            return api_response(success=False, message="Note not found.", status_code=404)

        return api_response(success=True, data={"note": note}, status_code=200)
    except Exception as e:
        logger.error(f"Get Note Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@notes_bp.route('/<note_id>', methods=['DELETE'])
@token_required
def delete_note(note_id):
    """Delete a note from MongoDB."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')

        NoteService.delete_note(user_id, note_id)
        return api_response(success=True, message="Note deleted successfully.", status_code=200)
    except Exception as e:
        logger.error(f"Delete Note Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@notes_bp.route('/export', methods=['POST'])
@token_required
def export_pdf():
    """Export note as printable HTML / PDF payload."""
    try:
        data = request.get_json() or {}
        title = data.get('title', 'noteX AI Notes')
        content = data.get('content', '')

        html_payload = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <title>{title}</title>
          <style>
            body {{ font-family: 'Helvetica', Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }}
            h1 {{ color: #4338ca; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }}
            h3, h4 {{ color: #0f172a; margin-top: 20px; }}
            code {{ background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }}
            .footer {{ margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }}
          </style>
        </head>
        <body>
          <h1>{title}</h1>
          <div>{content}</div>
          <div class="footer">Generated by noteX AI Platform for Class Study • noteX AI 2026</div>
        </body>
        </html>
        """

        return api_response(success=True, data={"html_payload": html_payload}, status_code=200)
    except Exception as e:
        logger.error(f"Export PDF Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
