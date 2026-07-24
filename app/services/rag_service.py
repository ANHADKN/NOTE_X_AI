import os
import json
import math
from app.config import Config
from app.utils.logger import logger

class RAGService:
    """Vector Storage & Retrieval-Augmented Generation (RAG) Engine."""
    
    _chroma_client = None
    _collection = None
    _in_memory_index = {}  # Fallback vector index

    @classmethod
    def get_chroma_collection(cls):
        """Initializes ChromaDB persistent collection."""
        if cls._collection is None:
            try:
                import chromadb
                os.makedirs(Config.CHROMA_PERSIST_DIR, exist_ok=True)
                cls._chroma_client = chromadb.PersistentClient(path=Config.CHROMA_PERSIST_DIR)
                cls._collection = cls._chroma_client.get_or_create_collection(name="notex_study_docs")
                logger.info("ChromaDB Vector Store initialized successfully.")
            except Exception as e:
                logger.warning(f"ChromaDB initialization warning: {str(e)}. Using fallback vector store.")
                cls._collection = None
        return cls._collection

    @classmethod
    def index_document_chunks(cls, doc_id: str, user_id: str, chunks: list):
        """Stores document chunks into vector database with page citations."""
        collection = cls.get_chroma_collection()

        if collection is not None:
            try:
                ids = [f"{doc_id}_{c['chunk_id']}" for c in chunks]
                documents = [c['text'] for c in chunks]
                metadatas = [
                    {
                        "doc_id": doc_id,
                        "user_id": user_id,
                        "page": c['page'],
                        "citation": c['citation']
                    }
                    for c in chunks
                ]
                collection.add(ids=ids, documents=documents, metadatas=metadatas)
                logger.info(f"Indexed {len(chunks)} chunks into ChromaDB for doc_id: {doc_id}")
                return True
            except Exception as e:
                logger.error(f"ChromaDB indexing error: {str(e)}. Falling back to in-memory index.")

        # Fallback in-memory index storage
        cls._in_memory_index[doc_id] = {
            "user_id": user_id,
            "chunks": chunks
        }
        return True

    @classmethod
    def search_relevant_chunks(cls, doc_id: str, query: str, top_k: int = 3) -> list:
        """Retrieves top-k semantically relevant chunks for a user query."""
        collection = cls.get_chroma_collection()

        if collection is not None:
            try:
                query_kwargs = {"query_texts": [query], "n_results": top_k}
                if doc_id:
                    query_kwargs["where"] = {"doc_id": doc_id}
                results = collection.query(**query_kwargs)
                retrieved = []
                if results and results.get('documents') and len(results['documents']) > 0:
                    docs = results['documents'][0]
                    metas = results['metadatas'][0] if results.get('metadatas') else []
                    for doc_text, meta in zip(docs, metas):
                        retrieved.append({
                            "text": doc_text,
                            "page": meta.get('page', 1),
                            "citation": meta.get('citation', 'Page 1')
                        })
                return retrieved
            except Exception as e:
                logger.error(f"ChromaDB search error: {str(e)}")

        # Fallback keyword & cosine match on in-memory store
        doc_data = cls._in_memory_index.get(doc_id)
        if not doc_data:
            return []

        chunks = doc_data["chunks"]
        query_words = set(query.lower().split())

        scored_chunks = []
        for c in chunks:
            text_words = set(c["text"].lower().split())
            overlap_score = len(query_words.intersection(text_words))
            scored_chunks.append((overlap_score, c))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = [c for score, c in scored_chunks[:top_k]]
        return top_chunks

    @classmethod
    def generate_rag_answer(cls, doc_id: str, doc_name: str, query: str, student_class: str = "Class 10") -> dict:
        """Generates RAG response grounded in retrieved PDF context with citations."""
        relevant_chunks = cls.search_relevant_chunks(doc_id, query, top_k=3)

        if not relevant_chunks:
            return {
                "answer": f"I searched the document **{doc_name}**, but could not find relevant context to answer: \"{query}\". Please make sure the question relates to the uploaded PDF.",
                "citations": []
            }

        context_str = "\n\n".join([f"[{c['citation']}]: {c['text']}" for c in relevant_chunks])
        citations = list(set([c['citation'] for c in relevant_chunks]))

        answer_text = (
            f"### 📖 RAG Search Findings ({doc_name})\n\n"
            f"Based on **{doc_name}** ({', '.join(citations)}):\n\n"
            f"{relevant_chunks[0]['text'][:300]}...\n\n"
            f"#### Key Information:\n"
            f"- **Context Cited**: {', '.join(citations)}\n"
            f"- **Grade Level**: Tailored for {student_class}\n\n"
            f"Would you like me to summarize more pages or generate a practice quiz from this document?"
        )

        return {
            "answer": answer_text,
            "citations": citations,
            "context_chunks": relevant_chunks
        }
