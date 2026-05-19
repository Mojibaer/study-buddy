import voyageai

_MODEL_DIMENSIONS = {
    "voyage-4-large": 2048,
    "voyage-3-large": 1024,
    "voyage-3": 1024,
    "voyage-3-lite": 512,
}


class VoyageProvider:
    name = "voyage"

    def __init__(self, api_key: str, model: str) -> None:
        if model not in _MODEL_DIMENSIONS:
            raise ValueError(
                f"Unknown Voyage model '{model}'. "
                f"Known: {sorted(_MODEL_DIMENSIONS)}"
            )
        self._client = voyageai.Client(api_key=api_key)
        self._model = model
        self.dimension = _MODEL_DIMENSIONS[model]

    def embed(self, text: str) -> list[float]:
        result = self._client.embed([text], model=self._model, input_type="document")
        return result.embeddings[0]

    def embed_query(self, text: str) -> list[float]:
        result = self._client.embed([text], model=self._model, input_type="query")
        return result.embeddings[0]

    def embed_many(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        result = self._client.embed(texts, model=self._model, input_type="document")
        return result.embeddings
