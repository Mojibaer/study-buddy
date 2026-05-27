import logging
import uuid

import weaviate
from weaviate.classes.config import Configure, DataType, Property
from weaviate.classes.query import Filter
from weaviate.exceptions import WeaviateConnectionError

from app.core.config import settings

logger = logging.getLogger(__name__)

# Stable namespace for deterministic document UUIDs — never change, would orphan all existing vectors.
DOCUMENT_UUID_NAMESPACE = uuid.UUID("6f3b2e4a-3c1d-4d4e-9b3a-5e8f1c2a7d10")


def collection_name(provider_name: str) -> str:
    return f"Documents_{provider_name}"


def document_uuid(document_id: int) -> str:
    return str(uuid.uuid5(DOCUMENT_UUID_NAMESPACE, str(document_id)))


class WeaviateService:
    def __init__(self) -> None:
        self._client: weaviate.WeaviateClient | None = None

    @property
    def client(self) -> weaviate.WeaviateClient:
        if self._client is None:
            raise RuntimeError("WeaviateService not connected. Call connect() first.")
        return self._client

    def connect(self) -> None:
        auth = (
            weaviate.auth.AuthApiKey(settings.WEAVIATE_API_KEY)
            if settings.WEAVIATE_API_KEY
            else None
        )
        self._client = weaviate.connect_to_custom(
            http_host=settings.WEAVIATE_HTTP_HOST,
            http_port=settings.WEAVIATE_HTTP_PORT,
            http_secure=settings.WEAVIATE_HTTP_SECURE,
            grpc_host=settings.WEAVIATE_GRPC_HOST,
            grpc_port=settings.WEAVIATE_GRPC_PORT,
            grpc_secure=settings.WEAVIATE_GRPC_SECURE,
            auth_credentials=auth,
            skip_init_checks=False,
        )
        if not self._client.is_ready():
            raise WeaviateConnectionError("Weaviate is not ready")

    def close(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None

    def bootstrap_collection(self, provider_name: str, dimension: int) -> None:
        name = collection_name(provider_name)
        if self.client.collections.exists(name):
            logger.info("Weaviate collection %s already exists", name)
            return

        self.client.collections.create(
            name=name,
            vectorizer_config=Configure.Vectorizer.none(),
            properties=[
                Property(name="document_id", data_type=DataType.INT),
                Property(name="text", data_type=DataType.TEXT),
            ],
        )
        logger.info("Created Weaviate collection %s (dim=%d)", name, dimension)

    def insert_document(
        self,
        provider_name: str,
        document_id: int,
        text: str,
        vector: list[float],
    ) -> str:
        name = collection_name(provider_name)
        obj_uuid = document_uuid(document_id)
        collection = self.client.collections.get(name)
        collection.data.insert(
            uuid=obj_uuid,
            properties={"document_id": document_id, "text": text},
            vector=vector,
        )
        return obj_uuid

    def delete_document(self, provider_name: str, document_id: int) -> bool:
        name = collection_name(provider_name)
        obj_uuid = document_uuid(document_id)
        collection = self.client.collections.get(name)
        if not collection.data.exists(obj_uuid):
            return False
        collection.data.delete_by_id(obj_uuid)
        return True

    def search(
        self,
        provider_name: str,
        query_vector: list[float],
        document_ids: list[int] | None,
        limit: int,
    ) -> list[dict]:
        name = collection_name(provider_name)
        collection = self.client.collections.get(name)
        filters = (
            Filter.by_property("document_id").contains_any(document_ids)
            if document_ids is not None
            else None
        )
        response = collection.query.near_vector(
            near_vector=query_vector,
            limit=limit,
            filters=filters,
            return_metadata=["distance"],
        )
        results: list[dict] = []
        for obj in response.objects:
            distance = obj.metadata.distance if obj.metadata else None
            score = 1.0 - distance if distance is not None else None
            results.append(
                {
                    "document_id": int(obj.properties["document_id"]),
                    "text": obj.properties.get("text", ""),
                    "score": score,
                }
            )
        return results

    def list_collections(self) -> list[str]:
        return list(self.client.collections.list_all().keys())

    def count(self, provider_name: str) -> int:
        name = collection_name(provider_name)
        collection = self.client.collections.get(name)
        return collection.aggregate.over_all(total_count=True).total_count
