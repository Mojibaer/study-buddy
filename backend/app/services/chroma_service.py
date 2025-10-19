import chromadb

class ChromaService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path="./chroma_data"
        )

        self.collection = self.client.get_or_create_collection(
            name="documents",
            metadata={"hnsw:space": "cosine"}
        )

    def add_document(self, doc_id: str, text: str, metadata: dict):
        """Dokument zu ChromaDB hinzufügen"""
        self.collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[doc_id]
        )

    def search(self, query: str, n_results: int = 10, filter_dict: dict = None):
        """Semantische Suche"""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=filter_dict
        )
        return results

# Singleton instance
chroma_service = ChromaService()