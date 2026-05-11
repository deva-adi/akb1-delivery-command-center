"""
Contract tests -- M8-4.

Three layers:
  1. Spec validity       -- FastAPI generates a valid OpenAPI 3.0 document.
  2. Frontend fetch map  -- every path the frontend calls is documented and
                           the method is present. Directional check only
                           (frontend -> spec); the inverse is not gated because
                           PATCH admin endpoints are built but the frontend admin
                           UI is deferred to v1.1.
  3. Schema conformance  -- schemathesis asserts no 5xx under PO+AP and RO
                           tokens across all endpoints and generated inputs.
                           Skipped if backend not reachable (local-only gate).

Gate: all assertions pass. Zero 5xx responses. No missing frontend paths.
"""

from __future__ import annotations

import uuid

import pytest
import requests
import schemathesis
from hypothesis import HealthCheck, settings

from app.auth.tokens import mint_token
from app.main import app

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

PO_UUID = uuid.UUID("00000000-0000-0000-0000-000000000001")
RO_UUID = uuid.UUID("00000000-0000-0000-0000-000000000006")

BACKEND_URL = "http://localhost:8000"


def _token(user_id: uuid.UUID, role: str, ap_flag: bool = False) -> str:
    return mint_token(user_id=user_id, role=role, ap_flag=ap_flag)


def _po_headers(ap_flag: bool = False) -> dict[str, str]:
    return {"Authorization": f"Bearer {_token(PO_UUID, 'PortfolioOwner', ap_flag)}"}


def _ro_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {_token(RO_UUID, 'ReadOnly')}"}


def _backend_reachable() -> bool:
    try:
        return requests.get(f"{BACKEND_URL}/health", timeout=2).status_code == 200
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Layer 1: spec validity
# ---------------------------------------------------------------------------

class TestSpecValidity:
    def test_openapi_version_is_3x(self):
        spec = app.openapi()
        assert spec["openapi"].startswith("3."), "Must be OpenAPI 3.x"

    def test_info_block_has_title_and_version(self):
        spec = app.openapi()
        info = spec.get("info", {})
        assert "title" in info
        assert "version" in info

    def test_minimum_path_count(self):
        spec = app.openapi()
        assert len(spec.get("paths", {})) >= 11

    def test_every_path_has_at_least_one_http_method(self):
        http_methods = {"get", "post", "put", "patch", "delete"}
        spec = app.openapi()
        for path, item in spec["paths"].items():
            assert set(item) & http_methods, f"{path!r} has no HTTP method"

    def test_every_operation_has_responses_block(self):
        http_methods = {"get", "post", "put", "patch", "delete"}
        spec = app.openapi()
        for path, item in spec["paths"].items():
            for method in http_methods:
                if method in item:
                    assert "responses" in item[method], (
                        f"{method.upper()} {path} missing responses block"
                    )


# ---------------------------------------------------------------------------
# Layer 2: frontend fetch coverage
# ---------------------------------------------------------------------------

# Every (METHOD, openapi_path) pair the frontend Server Components or Route
# Handlers call via callBackend. Updated whenever a new fetch is added.
# Source: grep callBackend + grep /api/v1/ in frontend/app/**
FRONTEND_FETCHES: frozenset[tuple[str, str]] = frozenset({
    ("GET",   "/api/v1/admin/threshold-register"),
    ("GET",   "/api/v1/admin/tier-config"),
    ("GET",   "/api/v1/people"),
    ("GET",   "/api/v1/programmes/{code}/health"),
    ("GET",   "/api/v1/programmes/{code}/milestones"),
    ("GET",   "/api/v1/programmes/{code}/raids"),
    ("GET",   "/api/v1/audit/search"),
    ("GET",   "/api/v1/audit/entry/{entry_id}"),
    ("POST",  "/api/v1/auth/login"),
})


class TestFrontendFetchCoverage:
    def test_all_frontend_fetches_in_openapi_spec(self):
        spec = app.openapi()
        spec_paths = spec["paths"]
        missing: list[str] = []
        for method, path in sorted(FRONTEND_FETCHES):
            if path not in spec_paths:
                missing.append(f"{method} {path}  [path not in spec]")
            elif method.lower() not in spec_paths[path]:
                missing.append(f"{method} {path}  [path exists, method missing]")
        assert not missing, (
            "Frontend fetches not covered by OpenAPI spec:\n"
            + "\n".join(f"  {m}" for m in missing)
        )

    def test_frontend_fetch_count_matches_expected(self):
        assert len(FRONTEND_FETCHES) == 9, (
            "FRONTEND_FETCHES changed size -- update this count if intentional"
        )


# ---------------------------------------------------------------------------
# Layer 3: schemathesis schema conformance
# ---------------------------------------------------------------------------

# schemathesis 3.x supports up to OpenAPI 3.0.x. FastAPI 0.115 emits 3.1.0.
# The spec content is 3.0-compatible (no prefixItems / unevaluatedProperties).
# Downgrade the version string for test purposes only; does not affect prod.
def _compat_spec() -> dict:
    spec = dict(app.openapi())
    spec["openapi"] = "3.0.3"
    return spec


_schema = schemathesis.from_dict(_compat_spec(), base_url=BACKEND_URL)

_reachable = _backend_reachable()


@pytest.mark.skipif(not _reachable, reason="backend not reachable at localhost:8000")
class TestSchemaConformance:
    """No endpoint returns 5xx under any schemathesis-generated input."""

    @_schema.parametrize()
    @settings(
        max_examples=5,
        suppress_health_check=[HealthCheck.too_slow, HealthCheck.filter_too_much],
        deadline=10_000,
    )
    def test_no_5xx_as_po(self, case):
        response = case.call(headers=_po_headers(ap_flag=True))
        assert response.status_code < 500, (
            f"Server error: {case.method} {case.formatted_path} "
            f"-> {response.status_code}\n{response.text[:300]}"
        )

    @_schema.parametrize()
    @settings(
        max_examples=5,
        suppress_health_check=[HealthCheck.too_slow, HealthCheck.filter_too_much],
        deadline=10_000,
    )
    def test_no_5xx_as_ro(self, case):
        response = case.call(headers=_ro_headers())
        assert response.status_code < 500, (
            f"Server error: {case.method} {case.formatted_path} "
            f"-> {response.status_code}\n{response.text[:300]}"
        )
