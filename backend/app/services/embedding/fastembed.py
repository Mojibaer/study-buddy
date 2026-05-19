from fastembed import TextEmbedding


class FastEmbedProvider:
    name = "fastembed"

    def __init__(self, model: str) -> None:
        self._model_name = model
        self._model = TextEmbedding(model_name=model)
        sample = next(iter(self._model.embed(["dim probe"])))
        self.dimension = len(sample)

    def embed(self, text: str) -> list[float]:
        vector = next(iter(self._model.embed([text])))
        return vector.tolist()

    def embed_query(self, text: str) -> list[float]:
        # MiniLM is a symmetric model; document and query embeddings live
        # in the same space, so the query path reuses embed().
        return self.embed(text)

    def embed_many(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        return [v.tolist() for v in self._model.embed(texts)]
