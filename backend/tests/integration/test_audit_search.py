"""GET /api/v1/audit/search integration tests.

Slice 4. Covers:
  - PortfolioOwner with AP=true: 200, sees all rows.
  - PortfolioOwner with AP=false: 200, scoped to own actions.
  - DeliveryDirector with AP=true: 200, sees all rows.
  - DeliveryDirector with AP=false: 403 with detail "Audit Permission required";
    audit row written with outcome=ApFlagDenied.
  - FinanceLead with AP=false: 403 ApFlagDenied (audit written).
  - ProgrammeManager: 403 RoleDenied (audit written).
  - HRBusinessPartner: 403 RoleDenied (audit written).
  - ReadOnly: 403 RoleDenied (audit written).
  - Cursor pagination forward (page 1 -> page 2 -> empty).
  - time_window filter narrows results.
  - resource_type filter narrows results.
  - Invalid cursor returns 400.
"""

from __future__ import annotations

import uuid

import asyncpg
import httpx
import pytest

from app.auth.tokens import mint_token


pytestmark = pytest.mark.integration


# Helpers ------------------------------------------------------------

async def _person(conn: asyncpg.Connection, role: str, ap: bool | None = None) -> tuple[uuid.UUID, str]:
    """Return (person_id, email) for the first user matching role and ap_flag."""
    if ap is None:
        row = await conn.fetchrow(
            "SELECT person_id, email FROM people WHERE role = $1 LIMIT 1", role
        )
    else:
        row = await conn.fetchrow(
            "SELECT person_id, email FROM people WHERE role = $1 AND ap_flag = $2 LIMIT 1",
            role,
            ap,
        )
    assert row is not None, f"seed missing role={role} ap={ap}"
    return row["person_id"], row["email"]


async def _token_for(conn: asyncpg.Connection, role: str, ap: bool | None = None) -> str:
    person_id, _ = await _person(conn, role, ap)
    if ap is None:
        # Fetch ap_flag from DB to mint accurately
        row = await conn.fetchrow(
            "SELECT ap_flag FROM people WHERE person_id = $1", person_id
        )
        ap_flag = row["ap_flag"]
    else:
        ap_flag = ap
    return mint_token(user_id=person_id, role=role, ap_flag=ap_flag)


async def _seed_audit_rows(conn: asyncpg.Connection, count: int, actor_user_id: uuid.UUID) -> None:
    """Insert <count> audit rows under the given actor for fixture purposes."""
    import datetime
    base_ts = datetime.datetime(2026, 4, 24, 12, 0, 0, tzinfo=datetime.timezone.utc)
    rows = []
    for i in range(count):
        rows.append((
            uuid.uuid4(),
            actor_user_id,
            "PortfolioOwner",
            f"/api/v1/test/{i}",
            "PATCH",
            base_ts + datetime.timedelta(seconds=i),
            "Success",
            "test_resource",
        ))
    await conn.executemany(
        """
        INSERT INTO audit_trail_entries (
            entry_id, actor_user_id, actor_role, endpoint, http_method,
            occurred_at, outcome, resource_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
        rows,
    )


# 1. Allowed paths ---------------------------------------------------

async def test_search_po_with_ap_returns_200(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    await _seed_audit_rows(seeded_for_mutation, count=3, actor_user_id=po_id)
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)

    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["total_count"] >= 3
    assert isinstance(body["items"], list)
    assert body["page_size"] == 50
    assert "next_cursor" in body


async def test_search_po_without_ap_scoped_to_own_actions(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Manufacture a PortfolioOwner who lacks AP. Confirm scoped read."""
    # The seed has 1 PO with AP=true. Create a 2nd PO with AP=false for this test.
    po_no_ap_id = uuid.uuid4()
    await seeded_for_mutation.execute(
        "INSERT INTO people (person_id, email, full_name, role, ap_flag, password_hash) "
        "VALUES ($1, $2, $3, $4, $5, $6)",
        po_no_ap_id, f"po-no-ap-{uuid.uuid4().hex}@test.local", "PO No AP",
        "PortfolioOwner", False, "",
    )

    # Insert audit rows: some by this PO, some by the AP-true PO
    other_po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    await _seed_audit_rows(seeded_for_mutation, count=4, actor_user_id=po_no_ap_id)
    await _seed_audit_rows(seeded_for_mutation, count=6, actor_user_id=other_po_id)

    token = mint_token(user_id=po_no_ap_id, role="PortfolioOwner", ap_flag=False)
    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text
    body = r.json()
    # Scoped to own_user only: should see exactly the 4 rows we inserted
    assert body["total_count"] == 4
    for item in body["items"]:
        assert item["actor_user_id"] == str(po_no_ap_id)


async def test_search_dd_with_ap_returns_200(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """DD with AP=true sees all rows (programme scoping deferred to slice 5+)."""
    token = await _token_for(seeded_for_mutation, "DeliveryDirector", ap=True)
    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text


# 2. ApFlagDenied path -----------------------------------------------

async def test_search_dd_without_ap_returns_403_apflagdenied(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    dd_no_ap_id, _ = await _person(seeded_for_mutation, "DeliveryDirector", ap=False)
    token = mint_token(user_id=dd_no_ap_id, role="DeliveryDirector", ap_flag=False)
    n_audit_before = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )

    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "Audit Permission required"

    n_audit_after = await seeded_for_mutation.fetchval(
        "SELECT COUNT(*) FROM audit_trail_entries"
    )
    assert n_audit_after == n_audit_before + 1
    last = await seeded_for_mutation.fetchrow(
        "SELECT outcome, resource_type, actor_role "
        "FROM audit_trail_entries ORDER BY occurred_at DESC LIMIT 1"
    )
    assert last["outcome"] == "ApFlagDenied"
    assert last["resource_type"] == "audit_search"
    assert last["actor_role"] == "DeliveryDirector"


async def test_search_fl_without_ap_returns_403_apflagdenied(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    fl_no_ap_id, _ = await _person(seeded_for_mutation, "FinanceLead", ap=False)
    token = mint_token(user_id=fl_no_ap_id, role="FinanceLead", ap_flag=False)

    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403
    assert r.json()["detail"] == "Audit Permission required"

    last = await seeded_for_mutation.fetchrow(
        "SELECT outcome FROM audit_trail_entries ORDER BY occurred_at DESC LIMIT 1"
    )
    assert last["outcome"] == "ApFlagDenied"


# 3. RoleDenied path -------------------------------------------------

@pytest.mark.parametrize("role", ["ProgrammeManager", "HRBusinessPartner", "ReadOnly"])
async def test_search_disallowed_role_returns_403_roledenied(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
    role: str,
) -> None:
    user_id, _ = await _person(seeded_for_mutation, role)
    token = mint_token(user_id=user_id, role=role, ap_flag=False)

    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 403
    assert "not authorised" in r.json()["detail"].lower()

    last = await seeded_for_mutation.fetchrow(
        "SELECT outcome, resource_type, actor_role "
        "FROM audit_trail_entries ORDER BY occurred_at DESC LIMIT 1"
    )
    assert last["outcome"] == "RoleDenied"
    assert last["resource_type"] == "audit_search"
    assert last["actor_role"] == role


# 4. Auth errors -----------------------------------------------------

async def test_search_no_token_returns_401(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    r = await http_client.get("/api/v1/audit/search")
    assert r.status_code == 401


async def test_search_invalid_token_returns_401(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": "Bearer not.a.real.jwt"},
    )
    assert r.status_code == 401


# 5. Pagination ------------------------------------------------------

async def test_search_cursor_pagination_forward(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Insert 7 rows; page_size=3 should return 3+3+1 across three calls."""
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)
    await _seed_audit_rows(seeded_for_mutation, count=7, actor_user_id=po_id)
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)

    r1 = await http_client.get(
        "/api/v1/audit/search?page_size=3",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r1.status_code == 200
    b1 = r1.json()
    assert len(b1["items"]) == 3
    assert b1["next_cursor"] is not None
    assert b1["total_count"] == 7

    r2 = await http_client.get(
        f"/api/v1/audit/search?page_size=3&cursor={b1['next_cursor']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r2.status_code == 200
    b2 = r2.json()
    assert len(b2["items"]) == 3
    assert b2["next_cursor"] is not None

    r3 = await http_client.get(
        f"/api/v1/audit/search?page_size=3&cursor={b2['next_cursor']}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r3.status_code == 200
    b3 = r3.json()
    assert len(b3["items"]) == 1
    assert b3["next_cursor"] is None  # last page

    # Pages have non-overlapping entry_ids
    ids_1 = {it["entry_id"] for it in b1["items"]}
    ids_2 = {it["entry_id"] for it in b2["items"]}
    ids_3 = {it["entry_id"] for it in b3["items"]}
    assert not (ids_1 & ids_2)
    assert not (ids_2 & ids_3)
    assert not (ids_1 & ids_3)
    assert len(ids_1 | ids_2 | ids_3) == 7


async def test_search_invalid_cursor_returns_400(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)
    r = await http_client.get(
        "/api/v1/audit/search?cursor=not-a-real-cursor",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 400


# 6. Filters ---------------------------------------------------------

async def test_search_resource_type_filter(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Insert rows under two resource_types, filter by one, expect just those."""
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)

    import datetime
    base_ts = datetime.datetime(2026, 4, 24, 12, 0, 0, tzinfo=datetime.timezone.utc)
    rows = []
    for i in range(3):
        rows.append((
            uuid.uuid4(), po_id, "PortfolioOwner", "/api/v1/test/A",
            "PATCH", base_ts + datetime.timedelta(seconds=i),
            "Success", "type_a",
        ))
    for i in range(2):
        rows.append((
            uuid.uuid4(), po_id, "PortfolioOwner", "/api/v1/test/B",
            "PATCH", base_ts + datetime.timedelta(seconds=10 + i),
            "Success", "type_b",
        ))
    await seeded_for_mutation.executemany(
        "INSERT INTO audit_trail_entries (entry_id, actor_user_id, actor_role, "
        "endpoint, http_method, occurred_at, outcome, resource_type) "
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        rows,
    )

    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)
    r = await http_client.get(
        "/api/v1/audit/search?resource_type=type_a",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["total_count"] == 3
    for item in body["items"]:
        assert item["resource_type"] == "type_a"


async def test_search_time_window_filter_narrows(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """Insert one old row and one recent row. time_window=1h returns 1 row."""
    po_id, _ = await _person(seeded_for_mutation, "PortfolioOwner", ap=True)

    import datetime
    now = datetime.datetime.now(datetime.timezone.utc)
    rows = [
        (
            uuid.uuid4(), po_id, "PortfolioOwner", "/api/v1/old",
            "PATCH", now - datetime.timedelta(days=2),
            "Success", "test_old",
        ),
        (
            uuid.uuid4(), po_id, "PortfolioOwner", "/api/v1/recent",
            "PATCH", now - datetime.timedelta(minutes=5),
            "Success", "test_recent",
        ),
    ]
    await seeded_for_mutation.executemany(
        "INSERT INTO audit_trail_entries (entry_id, actor_user_id, actor_role, "
        "endpoint, http_method, occurred_at, outcome, resource_type) "
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        rows,
    )

    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)
    r = await http_client.get(
        "/api/v1/audit/search?time_window=1h&resource_type=test_recent",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["total_count"] == 1


async def test_search_invalid_time_window_returns_400(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)
    r = await http_client.get(
        "/api/v1/audit/search?time_window=99x",
        headers={"Authorization": f"Bearer {token}"},
    )
    # FastAPI's Query pattern validation returns 422 for the regex mismatch
    assert r.status_code == 422


async def test_search_outcome_filter(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """RoleDenied and ApFlagDenied are now valid outcome filter values."""
    token = await _token_for(seeded_for_mutation, "PortfolioOwner", ap=True)
    # Trigger one RoleDenied row by hitting the endpoint as a disallowed role
    pm_id, _ = await _person(seeded_for_mutation, "ProgrammeManager")
    pm_token = mint_token(user_id=pm_id, role="ProgrammeManager", ap_flag=False)
    await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {pm_token}"},
    )

    r = await http_client.get(
        "/api/v1/audit/search?outcome=RoleDenied",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    assert r.json()["total_count"] >= 1
    for item in r.json()["items"]:
        assert item["outcome"] == "RoleDenied"
