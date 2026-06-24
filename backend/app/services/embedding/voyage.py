import logging
import time

import voyageai

from app.services.embedding.base import EmbeddingRateLimitError

logger = logging.getLogger(__name__)

_MODEL_DIMENSIONS = {
    "voyage-4-large": 2048,
    "voyage-3-large": 1024,
    "voyage-3": 1024,
    "voyage-3-lite": 512,
}


class VoyageProvider:
    name = "voyage"

    def __init__(
        self,
        api_key: str,
        model: str,
        max_retries: int = 3,
        retry_backoff_seconds: float = 20.0,
    ) -> None:
        if model not in _MODEL_DIMENSIONS:
            raise ValueError(
                f"Unknown Voyage model '{model}'. "
                f"Known: {sorted(_MODEL_DIMENSIONS)}"
            )
        self._client = voyageai.Client(api_key=api_key)
        self._model = model
        self.dimension = _MODEL_DIMENSIONS[model]
        self._max_retries = max_retries
        self._retry_backoff_seconds = retry_backoff_seconds

    def _embed(self, texts: list[str], input_type: str) -> list[list[float]]:
        """Call Voyage, retrying on rate-limit errors with a fixed backoff.

        The free tier allows only 3 requests/minute, so a bulk upload that fires
        several embed calls in quick succession trips the limit. Rather than
        surface a 500, we wait out the window and retry; only after exhausting
        retries do we raise EmbeddingRateLimitError for the caller to map to 429.
        """
        for attempt in range(1, self._max_retries + 1):
            try:
                result = self._client.embed(texts, model=self._model, input_type=input_type)
                return result.embeddings
            except voyageai.error.RateLimitError:
                if attempt >= self._max_retries:
                    logger.warning("Voyage rate limit hit; retries exhausted after %d attempts", attempt)
                    raise EmbeddingRateLimitError(
                        "Embedding provider rate limit exceeded. Please try again shortly."
                    )
                logger.info(
                    "Voyage rate limit hit (attempt %d/%d); backing off %.0fs",
                    attempt, self._max_retries, self._retry_backoff_seconds,
                )
                time.sleep(self._retry_backoff_seconds)
        # Unreachable: the loop either returns or raises.
        raise EmbeddingRateLimitError("Embedding provider rate limit exceeded.")

    def embed(self, text: str) -> list[float]:
        return self._embed([text], "document")[0]

    def embed_query(self, text: str) -> list[float]:
        return self._embed([text], "query")[0]

    def embed_many(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        return self._embed(texts, "document")
