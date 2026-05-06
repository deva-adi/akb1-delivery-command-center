"""Verifies the /health probe is wired and returns the expected payload."""

from fastapi.testclient import TestClient


def test_health_returns_200(client: TestClient) -> None:
    r = client.get("/health")
    assert r.status_code == 200


def test_health_payload_shape(client: TestClient) -> None:
    r = client.get("/health")
    body = r.json()
    assert body["status"] == "ok"
    assert "service" in body
    assert "version" in body
