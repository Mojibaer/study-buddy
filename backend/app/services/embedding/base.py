from typing import Protocol, runtime_checkable


class EmbeddingRateLimitError(Exception):
    """Raised when the embedding provider's rate limit is exhausted after retries."""


@runtime_checkable
class EmbeddingProvider(Protocol):
    name: str
    dimension: int

    def embed(self, text: str) -> list[float]: ...

    def embed_query(self, text: str) -> list[float]: ...

    def embed_many(self, texts: list[str]) -> list[list[float]]: ...
