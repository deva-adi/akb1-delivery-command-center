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
    ("GET",   "/api/v1/programmes"),
    ("GET",   "/api/v1/programmes/{code}"),
    ("GET",   "/api/v1/programmes/{code}/health"),
    ("GET",   "/api/v1/programmes/{code}/milestones"),
    ("GET",   "/api/v1/programmes/{code}/milestones/{milestone_id}"),
    ("GET",   "/api/v1/programmes/{code}/raids"),
    ("GET",   "/api/v1/programmes/{code}/raids/{raid_id}"),
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
        assert len(FRONTEND_FETCHES) == 13, (
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


# ---------------------------------------------------------------------------
# M10-1 new endpoints -- targeted no-5xx coverage (M10-8 addition)
# ---------------------------------------------------------------------------

_M10_PATHS = [
    "/api/v1/programmes",
    "/api/v1/programmes/PEGASUS",
    "/api/v1/programmes/ANDROMEDA",
]

_M10_PARAM_PATHS = [
    "/api/v1/programmes/PEGASUS/raids",
    "/api/v1/programmes/PEGASUS/milestones",
]


@pytest.mark.skipif(not _reachable, reason="backend not reachable at localhost:8000")
class TestM10EndpointsNoPO5xx:
    """GET /api/v1/programmes* endpoints return no 5xx under PO token."""

    def test_programmes_list_no_5xx(self):
        r = requests.get(f"{BACKEND_URL}/api/v1/programmes",
                         headers=_po_headers(ap_flag=True), timeout=5)
        assert r.status_code < 500, f"5xx: GET /api/v1/programmes -> {r.status_code}"

    def test_programme_pegasus_no_5xx(self):
        r = requests.get(f"{BACKEND_URL}/api/v1/programmes/PEGASUS",
                         headers=_po_headers(ap_flag=True), timeout=5)
        assert r.status_code < 500, f"5xx: GET /api/v1/programmes/PEGASUS -> {r.status_code}"

    def test_programme_andromeda_no_5xx(self):
        r = requests.get(f"{BACKEND_URL}/api/v1/programmes/ANDROMEDA",
                         headers=_po_headers(ap_flag=True), timeout=5)
        assert r.status_code < 500, f"5xx: GET /api/v1/programmes/ANDROMEDA -> {r.status_code}"

    def test_programme_raids_detail_unknown_id_returns_404_not_500(self):
        fake_id = "00000000-0000-0000-0000-000000000099"
        r = requests.get(
            f"{BACKEND_URL}/api/v1/programmes/PEGASUS/raids/{fake_id}",
            headers=_po_headers(ap_flag=True), timeout=5,
        )
        assert r.status_code < 500, (
            f"5xx on unknown RAID id: GET /api/v1/programmes/PEGASUS/raids/{fake_id} "
            f"-> {r.status_code}"
        )
        # 429 is allowed: rate limiter fires when run immediately after schemathesis (D-064)
        assert r.status_code in (404, 403, 422, 429), (
            f"Expected 404/403/422/429 for unknown id, got {r.status_code}"
        )

    def test_programme_milestones_detail_unknown_id_returns_404_not_500(self):
        fake_id = "00000000-0000-0000-0000-000000000099"
        r = requests.get(
            f"{BACKEND_URL}/api/v1/programmes/PEGASUS/milestones/{fake_id}",
            headers=_po_headers(ap_flag=True), timeout=5,
        )
        assert r.status_code < 500, (
            f"5xx on unknown milestone id: GET /api/v1/programmes/PEGASUS/milestones/{fake_id} "
            f"-> {r.status_code}"
        )
        # 429 is allowed: rate limiter fires when run immediately after schemathesis (D-064)
        assert r.status_code in (404, 403, 422, 429), (
            f"Expected 404/403/422/429 for unknown id, got {r.status_code}"
        )

    def test_audit_entry_detail_unknown_id_returns_404_not_500(self):
        fake_id = "00000000-0000-0000-0000-000000000099"
        r = requests.get(
            f"{BACKEND_URL}/api/v1/audit/entry/{fake_id}",
            headers=_po_headers(ap_flag=True), timeout=5,
        )
        assert r.status_code < 500, (
            f"5xx on unknown audit entry: GET /api/v1/audit/entry/{fake_id} "
            f"-> {r.status_code}"
        )
        # 429 is allowed: rate limiter fires when run immediately after schemathesis (D-064)
        assert r.status_code in (404, 403, 422, 429), (
            f"Expected 404/403/422/429 for unknown audit entry, got {r.status_code}"
        )


@pytest.mark.skipif(not _reachable, reason="backend not reachable at localhost:8000")
class TestM10EndpointsNoPM5xx:
    """Same 5 endpoints under ProgrammeManager token -- no 5xx allowed."""

    PM_UUID = uuid.UUID("00000000-0000-0000-0000-000000000003")

    def _pm_headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {_token(self.PM_UUID, 'ProgrammeManager')}"}

    def test_programmes_list_no_5xx(self):
        r = requests.get(f"{BACKEND_URL}/api/v1/programmes",
                         headers=self._pm_headers(), timeout=5)
        assert r.status_code < 500, f"5xx: GET /api/v1/programmes -> {r.status_code}"

    def test_programme_single_no_5xx(self):
        r = requests.get(f"{BACKEND_URL}/api/v1/programmes/PEGASUS",
                         headers=self._pm_headers(), timeout=5)
        assert r.status_code < 500, f"5xx: GET /api/v1/programmes/PEGASUS -> {r.status_code}"

    def test_programme_raids_detail_unknown_id_no_5xx(self):
        fake_id = "00000000-0000-0000-0000-000000000099"
        r = requests.get(
            f"{BACKEND_URL}/api/v1/programmes/PEGASUS/raids/{fake_id}",
            headers=self._pm_headers(), timeout=5,
        )
        assert r.status_code < 500

    def test_programme_milestones_detail_unknown_id_no_5xx(self):
        fake_id = "00000000-0000-0000-0000-000000000099"
        r = requests.get(
            f"{BACKEND_URL}/api/v1/programmes/PEGASUS/milestones/{fake_id}",
            headers=self._pm_headers(), timeout=5,
        )
        assert r.status_code < 500

    def test_audit_entry_unknown_id_no_5xx(self):
        fake_id = "00000000-0000-0000-0000-000000000099"
        r = requests.get(
            f"{BACKEND_URL}/api/v1/audit/entry/{fake_id}",
            headers=self._pm_headers(), timeout=5,
        )
        assert r.status_code < 500
