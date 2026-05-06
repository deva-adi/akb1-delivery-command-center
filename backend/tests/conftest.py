"""Shared test fixtures.

Slice 1 covers only the FastAPI scaffold plus the PATCH /admin/tier-config
endpoint. Database fixtures land alongside the migration in slice 3.3.
"""

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client() -> Iterator[TestClient]:
    """Synchronous TestClient. Sufficient for /health and pure-app tests."""
    with TestClient(app) as c:
        yield c
