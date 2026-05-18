from functools import lru_cache

from app.core.config import settings
from app.services.embedding.base import EmbeddingProvider


@lru_cache(maxsize=1)
def get_provider() -> EmbeddingProvider:
    if settings.EMBEDDING_PROVIDER == "voyage":
        if not settings.VOYAGE_API_KEY:
            raise RuntimeError(
                "EMBEDDING_PROVIDER=voyage but VOYAGE_API_KEY is not set. "
                "Set the key or switch to EMBEDDING_PROVIDER=fastembed."
            )
        from app.services.embedding.voyage import VoyageProvider

        return VoyageProvider(
            api_key=settings.VOYAGE_API_KEY,
            model=settings.VOYAGE_MODEL,
        )

    if settings.EMBEDDING_PROVIDER == "fastembed":
        from app.services.embedding.fastembed import FastEmbedProvider

        return FastEmbedProvider(model=settings.FASTEMBED_MODEL)

    raise RuntimeError(f"Unknown EMBEDDING_PROVIDER: {settings.EMBEDDING_PROVIDER!r}")
