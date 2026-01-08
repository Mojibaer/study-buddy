import os
import chromadb

class ChromaService:
    def __init__(self):
        self.client = chromadb.HttpClient(
            host=os.getenv("CHROMA_HOST", "localhost"),
            port="8100"
        )

        self.collection = self.client.get_or_create_collection(
            name=os.getenv("CHROMA_COLLECTION", "documents"),
            metadata={"hnsw:space": "cosine"}
        )

    def add_document(self, doc_id: str, text: str, metadata: dict):
        self.collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[doc_id]
        )

    def search(self, query: str, n_results: int = 10, filter_dict: dict = None):
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=filter_dict
        )
        return results

    def delete_document(self, doc_id: str):
        try:
            self.collection.delete(ids=[doc_id])
        except Exception as e:
            print(f"Error deleting from ChromaDB: {e}")

# Singleton instance
chroma_service = ChromaService()