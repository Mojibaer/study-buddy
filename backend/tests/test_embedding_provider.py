import os

import pytest

from app.core.config import Settings
from app.services.embedding.factory import build_provider
from app.services.embedding.fastembed import FastEmbedProvider
from app.services.embedding.voyage import VoyageProvider


def test_factory_returns_fastembed_by_default(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "fastembed")
    monkeypatch.setattr("app.services.embedding.factory.settings", Settings())

    provider = build_provider()

    assert isinstance(provider, FastEmbedProvider)
    assert provider.name == "fastembed"


def test_factory_voyage_without_key_raises(monkeypatch):
    monkeypatch.setenv("EMBEDDING_PROVIDER", "voyage")
    monkeypatch.delenv("VOYAGE_API_KEY", raising=False)
    monkeypatch.setattr("app.services.embedding.factory.settings", Settings())

    with pytest.raises(RuntimeError, match="VOYAGE_API_KEY"):
        build_provider()


def test_factory_unknown_provider_raises(monkeypatch):
    monkeypatch.setattr(
        "app.services.embedding.factory.settings",
        type("S", (), {"EMBEDDING_PROVIDER": "bogus"})(),
    )

    with pytest.raises(RuntimeError, match="Unknown EMBEDDING_PROVIDER"):
        build_provider()


def test_fastembed_returns_correct_dimension():
    provider = FastEmbedProvider(
        model="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    vector = provider.embed("Hallo Welt")

    assert provider.dimension == 384
    assert len(vector) == 384
    assert all(isinstance(x, float) for x in vector)


def test_fastembed_embed_query_matches_embed():
    provider = FastEmbedProvider(
        model="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    assert provider.embed_query("Hallo Welt") == provider.embed("Hallo Welt")


def test_fastembed_embed_many_returns_one_vector_per_input():
    provider = FastEmbedProvider(
        model="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    vectors = provider.embed_many(["foo", "bar", "baz"])

    assert len(vectors) == 3
    assert all(len(v) == provider.dimension for v in vectors)


def test_fastembed_embed_many_empty_returns_empty():
    provider = FastEmbedProvider(
        model="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    )

    assert provider.embed_many([]) == []


@pytest.mark.skipif(
    not os.getenv("VOYAGE_API_KEY"),
    reason="VOYAGE_API_KEY not set",
)
def test_voyage_returns_2048_dim_for_voyage_4_large():
    provider = VoyageProvider(
        api_key=os.environ["VOYAGE_API_KEY"],
        model="voyage-4-large",
    )

    vector = provider.embed("Hallo Welt")

    assert provider.dimension == 2048
    assert len(vector) == 2048


def test_voyage_unknown_model_raises():
    with pytest.raises(ValueError, match="Unknown Voyage model"):
        VoyageProvider(api_key="fake", model="not-a-real-model")
