"""
AKB1 Delivery Command Center -- Locust benchmark (M8-5).

Targets the FastAPI backend at BACKEND_URL (default http://localhost:8000).
All requests use a pre-minted PO+AP JWT; the token is generated once at
module load time and reused across all virtual users to avoid per-request
crypto overhead skewing latency numbers.

Endpoint mix (approximates real usage pattern from Architecture doc 05):
  GET /health                              -- 5%  baseline/keepalive
  GET /api/v1/admin/tier-config            -- 10% tab load (governance)
  GET /api/v1/admin/threshold-register     -- 5%  tab load (governance)
  GET /api/v1/people                       -- 15% capability/workforce tabs
  GET /api/v1/programmes/{code}/raids      -- 20% executive/raid tabs
  GET /api/v1/programmes/{code}/milestones -- 20% delivery health/flow tabs
  GET /api/v1/programmes/{code}/health     -- 20% all snapshot tabs
  GET /api/v1/audit/search                 -- 5%  audit console

SLA gates (05_Performance_Benchmarks.md section 1):
  100 concurrent  -- p95 < 600ms   GREEN  (hard gate)
  500 concurrent  -- p95 < 1200ms  GREEN  (target)
  1000 concurrent -- p95 < 2500ms  AMBER  (acceptable)

Run profiles (shortened for local gate; PRD full profiles are 15-45 min):
  Profile A (100 users):  --users 100 --spawn-rate 10 --run-time 60s
  Profile B (500 users):  --users 500 --spawn-rate 25 --run-time 120s
  Profile C (1000 users): --users 1000 --spawn-rate 50 --run-time 60s

Usage:
  cd infra/benchmark
  ../../backend/.venv/bin/locust --headless \\
    --users 100 --spawn-rate 10 --run-time 60s \\
    --host http://localhost:8000 \\
    --csv results/profile_a
"""

from __future__ import annotations

import os
import random
import sys
import uuid

# Resolve backend package from repo root so mint_token is importable
_repo = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
_backend = os.path.join(_repo, "backend")
if _backend not in sys.path:
    sys.path.insert(0, _backend)

from locust import HttpUser, between, task

from app.auth.tokens import mint_token

# ---------------------------------------------------------------------------
# Shared token -- minted once, used by every virtual user
# ---------------------------------------------------------------------------

_PO_UUID = uuid.UUID("00000000-0000-0000-0000-000000000001")
_TOKEN = mint_token(user_id=_PO_UUID, role="PortfolioOwner", ap_flag=True,
                    expires_in_seconds=7200)
_AUTH = {"Authorization": f"Bearer {_TOKEN}"}

_PROGRAMME_CODES = [
    "PEGASUS", "PHOENIX", "ORION", "STELLAR", "HELIX",
    "ATLAS", "DRACO", "LYRA", "VEGA", "ANDROMEDA",
]


def _code() -> str:
    return random.choice(_PROGRAMME_CODES)


# ---------------------------------------------------------------------------
# User class
# ---------------------------------------------------------------------------

class AKB1User(HttpUser):
    """Simulates a Portfolio Owner navigating the command centre."""

    wait_time = between(0.5, 2.0)

    # Weights: 5 + 10 + 5 + 15 + 20 + 20 + 20 + 5 = 100
    @task(5)
    def health(self):
        self.client.get("/health", name="/health")

    @task(10)
    def tier_config(self):
        self.client.get("/api/v1/admin/tier-config", headers=_AUTH,
                        name="/api/v1/admin/tier-config")

    @task(5)
    def threshold_register(self):
        self.client.get("/api/v1/admin/threshold-register", headers=_AUTH,
                        name="/api/v1/admin/threshold-register")

    @task(15)
    def people(self):
        self.client.get("/api/v1/people", headers=_AUTH,
                        name="/api/v1/people")

    @task(20)
    def programme_raids(self):
        self.client.get(f"/api/v1/programmes/{_code()}/raids", headers=_AUTH,
                        name="/api/v1/programmes/{code}/raids")

    @task(20)
    def programme_milestones(self):
        self.client.get(f"/api/v1/programmes/{_code()}/milestones", headers=_AUTH,
                        name="/api/v1/programmes/{code}/milestones")

    @task(20)
    def programme_health(self):
        self.client.get(f"/api/v1/programmes/{_code()}/health", headers=_AUTH,
                        name="/api/v1/programmes/{code}/health")

    @task(5)
    def audit_search(self):
        self.client.get("/api/v1/audit/search?time_window=7d&page_size=50",
                        headers=_AUTH, name="/api/v1/audit/search")
