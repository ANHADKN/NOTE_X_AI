import os
import datetime
from flask import Blueprint, request
from werkzeug.utils import secure_filename
from bson import ObjectId

from app.config import Config
from app.utils.auth import token_required
from app.utils.response import api_response
from app.utils.pdf_processor import PDFProcessor
from app.services.rag_service import RAGService
from app.models.mongo import mongo_manager
from app.models.schemas import DocumentModel, BaseModel
from app.utils.logger import logger

rag_bp = Blueprint('rag_bp', __name__, url_prefix='/api/rag')

IN_MEMORY_DOCS = {}

@rag_bp.route('/upload', methods=['POST'])
@token_required
def upload_pdf():
    """Upload PDF document, extract text, build RAG vector index."""
    try:
        if 'file' not in request.files:
            return api_response(success=False, message="No file uploaded.", status_code=400)
        file = request.files['file']

        is_valid, err_msg = PDFProcessor.validate_pdf_file(file)
        if not is_valid:
            return api_response(success=False, message=err_msg, status_code=400)

        user_info = request.user
        user_id = user_info.get('user_id')
        student_class = user_info.get('student_class', 'Class 10')
        subject = request.form.get('subject', 'General')

        filename = secure_filename(file.filename)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        saved_filename = f"{user_id}_{timestamp}_{filename}"
        filepath = os.path.join(Config.UPLOAD_FOLDER, saved_filename)
        file.save(filepath)

        # 1. Extract text page by page
        pages_content = PDFProcessor.extract_text_page_by_page(filepath)
        if not pages_content:
            return api_response(success=False, message="Unable to extract text from PDF. It may be scanned or empty.", status_code=400)

        # 2. Chunk document text
        chunks = PDFProcessor.chunk_document(pages_content)

        # 3. Insert record into database
        db = mongo_manager.get_db()
        doc_record = DocumentModel.create_doc_record(
            user_id=user_id,
            filename=filename,
            filepath=filepath,
            num_pages=len(pages_content),
            num_chunks=len(chunks),
            student_class=student_class,
            subject=subject
        )

        if db is not None:
            res = db.documents.insert_one(doc_record)
            doc_id = str(res.inserted_id)
        else:
            doc_id = f"doc_{len(IN_MEMORY_DOCS) + 1}"
            doc_record['_id'] = doc_id
            IN_MEMORY_DOCS[doc_id] = doc_record

        # 4. Index chunks into vector database
        RAGService.index_document_chunks(doc_id, user_id, chunks)

        logger.info(f"Successfully processed PDF '{filename}' ({len(pages_content)} pages, {len(chunks)} chunks).")

        return api_response(
            success=True,
            message=f"PDF '{filename}' uploaded and indexed successfully!",
            data={
                "doc_id": doc_id,
                "filename": filename,
                "num_pages": len(pages_content),
                "num_chunks": len(chunks),
                "student_class": student_class,
                "subject": subject
            },
            status_code=201
        )
    except Exception as e:
        logger.error(f"PDF Upload Error: {str(e)}")
        return api_response(success=False, message=f"Upload failed: {str(e)}", status_code=500)

@rag_bp.route('/query', methods=['POST'])
@token_required
def query_pdf():
    """Query an indexed PDF document using RAG semantic search."""
    try:
        data = request.get_json() or {}
        doc_id = data.get('doc_id', '').strip()
        query = data.get('query', '').strip()
        user_info = request.user
        student_class = user_info.get('student_class', 'Class 10')

        if not doc_id or not query:
            return api_response(success=False, message="doc_id and query string are required.", status_code=400)

        db = mongo_manager.get_db()
        doc_record = None

        if db is not None:
            try:
                doc_record = db.documents.find_one({"_id": ObjectId(doc_id)})
            except Exception:
                pass
        
        if not doc_record:
            doc_record = IN_MEMORY_DOCS.get(doc_id)

        doc_name = doc_record.get('filename', 'Document') if doc_record else 'Document'

        # Generate RAG response
        rag_result = RAGService.generate_rag_answer(
            doc_id=doc_id,
            doc_name=doc_name,
            query=query,
            student_class=student_class
        )

        return api_response(
            success=True,
            data={
                "doc_id": doc_id,
                "doc_name": doc_name,
                "query": query,
                "answer": rag_result["answer"],
                "citations": rag_result["citations"]
            },
            status_code=200
        )
    except Exception as e:
        logger.error(f"RAG Query Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)

@rag_bp.route('/documents', methods=['GET'])
@token_required
def get_user_documents():
    """Fetch all uploaded PDF documents for current student session."""
    try:
        user_info = request.user
        user_id = user_info.get('user_id')
        db = mongo_manager.get_db()

        if db is not None:
            docs = list(db.documents.find({"user_id": user_id}).sort("uploaded_at", -1))
            serialized = BaseModel.serialize_doc(docs)
        else:
            user_docs = [v for k, v in IN_MEMORY_DOCS.items() if v.get('user_id') == user_id]
            serialized = BaseModel.serialize_doc(user_docs)

        return api_response(success=True, data={"documents": serialized}, status_code=200)
    except Exception as e:
        logger.error(f"Get Documents Error: {str(e)}")
        return api_response(success=False, message=str(e), status_code=500)
