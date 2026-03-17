import logging
import os
import chromadb

logger = logging.getLogger(__name__)


class ChromaService:
    def __init__(self) -> None:
        self.client = chromadb.HttpClient(
            host=os.getenv("CHROMA_HOST", "localhost"),
            port=os.getenv("CHROMA_PORT", "8100")
        )

        self.collection = self.client.get_or_create_collection(
            name=os.getenv("CHROMA_COLLECTION", "documents"),
            metadata={"hnsw:space": "cosine"}
        )

    def add_document(self, doc_id: str, text: str, metadata: dict) -> None:
        self.collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[doc_id]
        )

    def search(self, query: str, n_results: int = 10, filter_dict: dict | None = None) -> dict:
        return self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=filter_dict
        )

    def delete_document(self, doc_id: str) -> None:
        try:
            self.collection.delete(ids=[doc_id])
        except Exception:
            logger.error("Error deleting from ChromaDB", exc_info=True)


# Singleton instance
chroma_service = ChromaService()
