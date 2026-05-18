import logging

import weaviate
from weaviate.classes.config import Configure, DataType, Property
from weaviate.exceptions import WeaviateConnectionError

from app.core.config import settings

logger = logging.getLogger(__name__)


def collection_name(provider_name: str) -> str:
    return f"Documents_{provider_name}"


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


weaviate_service = WeaviateService()
