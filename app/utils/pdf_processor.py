import os
from werkzeug.utils import secure_filename
from app.utils.logger import logger

class PDFProcessor:
    """PDF Extraction and Semantic Chunking Utility."""

    @staticmethod
    def validate_pdf_file(file_storage) -> tuple[bool, str]:
        """Validates file upload security (filename, magic bytes, size limits)."""
        if not file_storage or not file_storage.filename:
            return False, "No file provided."

        filename = secure_filename(file_storage.filename)
        if not filename.lower().endswith('.pdf'):
            return False, "Only PDF files are allowed."

        file_storage.seek(0, os.SEEK_END)
        file_size = file_storage.tell()
        file_storage.seek(0)

        if file_size > 16 * 1024 * 1024:
            return False, "File size exceeds 16MB limit."

        header = file_storage.read(1024)
        file_storage.seek(0)

        if b'%PDF-' not in header:
            return False, "Invalid PDF header signature."

        return True, filename

    @staticmethod
    def extract_text_page_by_page(filepath: str) -> list:
        """Extracts text page-by-page using pypdf or pdfplumber."""
        pages_content = []

        # Try pypdf first
        try:
            from pypdf import PdfReader
            reader = PdfReader(filepath)
            for page_num, page in enumerate(reader.pages, start=1):
                text = page.extract_text() or ""
                if text.strip():
                    pages_content.append({"page": page_num, "text": text.strip()})
        except Exception as e:
            logger.warning(f"pypdf extraction error on {filepath}: {str(e)}. Retrying with pdfplumber.")
            pages_content = []

        # Fallback to pdfplumber if pypdf was empty or failed
        if not pages_content:
            try:
                import pdfplumber
                with pdfplumber.open(filepath) as pdf:
                    for page_num, page in enumerate(pdf.pages, start=1):
                        text = page.extract_text() or ""
                        if text.strip():
                            pages_content.append({"page": page_num, "text": text.strip()})
            except Exception as e:
                logger.warning(f"pdfplumber extraction warning on {filepath}: {str(e)}")

        # Fallback plain text reader
        if not pages_content:
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                    if text.strip():
                        pages_content.append({"page": 1, "text": text.strip()})
            except Exception as e:
                logger.error(f"Plain text fallback extraction error: {str(e)}")

        return pages_content

    @classmethod
    def chunk_document(cls, pages_content: list, chunk_size: int = 500, overlap: int = 100) -> list:
        """Splits document text into overlapping chunks with page citations."""
        chunks = []
        chunk_id = 1

        for p_info in pages_content:
            page_num = p_info["page"]
            text = p_info["text"]

            if len(text) <= chunk_size:
                chunks.append({
                    "chunk_id": f"chunk_{chunk_id}",
                    "page": page_num,
                    "text": text,
                    "citation": f"Page {page_num}"
                })
                chunk_id += 1
            else:
                start = 0
                while start < len(text):
                    end = start + chunk_size
                    chunk_text = text[start:end]
                    
                    if chunk_text.strip():
                        chunks.append({
                            "chunk_id": f"chunk_{chunk_id}",
                            "page": page_num,
                            "text": chunk_text.strip(),
                            "citation": f"Page {page_num}"
                        })
                        chunk_id += 1
                    
                    start += (chunk_size - overlap)

        return chunks
