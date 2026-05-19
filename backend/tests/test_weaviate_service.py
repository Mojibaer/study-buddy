import pytest

from app.services.weaviate_service import WeaviateService, collection_name


def test_collection_name_uses_provider():
    assert collection_name("fastembed") == "Documents_fastembed"
    assert collection_name("voyage") == "Documents_voyage"


def test_client_raises_when_not_connected():
    service = WeaviateService()
    with pytest.raises(RuntimeError, match="not connected"):
        _ = service.client


@pytest.fixture(scope="module")
def connected_service():
    service = WeaviateService()
    service.connect()
    yield service
    service.close()


@pytest.mark.integration
def test_connect_to_compose_weaviate_is_ready(connected_service):
    assert connected_service.client.is_ready() is True


@pytest.mark.integration
def test_bootstrap_creates_collection(connected_service):
    name = collection_name("phase1_test")
    if connected_service.client.collections.exists(name):
        connected_service.client.collections.delete(name)

    connected_service.bootstrap_collection("phase1_test", dimension=384)

    assert connected_service.client.collections.exists(name)
    connected_service.client.collections.delete(name)


@pytest.mark.integration
def test_bootstrap_is_idempotent(connected_service):
    name = collection_name("phase1_idem")
    if connected_service.client.collections.exists(name):
        connected_service.client.collections.delete(name)

    connected_service.bootstrap_collection("phase1_idem", dimension=384)
    connected_service.bootstrap_collection("phase1_idem", dimension=384)

    assert connected_service.client.collections.exists(name)
    connected_service.client.collections.delete(name)
