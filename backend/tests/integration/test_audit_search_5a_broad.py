"""5a-broad audit search scoping tests (slice M7-2).

Verifies that DD/FL with AP=true can see audit rows WHERE the resource
(programme_raid, programme_milestone, programme_health_snapshot) belongs
to one of their assigned programmes, and cannot see rows where the resource
belongs to a programme they are not assigned to.

Uses seeded_for_mutation (per-test schema reset) to isolate audit row
inserts from the shared session-scoped seed.
"""

from __future__ import annotations

import datetime
import uuid

import asyncpg
import httpx
import pytest

from app.auth.tokens import mint_token


pytestmark = pytest.mark.integration


async def _person_id_by_role(conn: asyncpg.Connection, role: str) -> uuid.UUID:
    row = await conn.fetchrow(
        "SELECT person_id FROM people WHERE role = $1 LIMIT 1", role
    )
    return row["person_id"]


async def _insert_audit_row(
    conn: asyncpg.Connection,
    *,
    actor_user_id: uuid.UUID,
    resource_type: str,
    resource_id: uuid.UUID,
) -> uuid.UUID:
    entry_id = uuid.uuid4()
    await conn.execute(
        """
        INSERT INTO audit_trail_entries (
            entry_id, actor_user_id, actor_role, endpoint, http_method,
            occurred_at, outcome, resource_type, resource_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """,
        entry_id,
        actor_user_id,
        "PortfolioOwner",
        "/api/v1/programmes/test/raids",
        "PATCH",
        datetime.datetime.now(datetime.timezone.utc),
        "Success",
        resource_type,
        resource_id,
    )
    return entry_id


async def test_5a_broad_raid_in_assigned_programme_visible(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """DD with AP sees audit row for a RAID that belongs to their programme."""
    dd_row = await seeded_for_mutation.fetchrow(
        "SELECT person_id FROM people WHERE role = 'DeliveryDirector' AND ap_flag = true LIMIT 1"
    )
    dd_id: uuid.UUID = dd_row["person_id"]

    assigned = await seeded_for_mutation.fetchrow(
        "SELECT programme_id FROM person_programme_assignments WHERE person_id = $1 LIMIT 1",
        dd_id,
    )
    assigned_code: str = assigned["programme_id"]

    raid = await seeded_for_mutation.fetchrow(
        "SELECT raid_id FROM programme_raids WHERE programme_code = $1 LIMIT 1",
        assigned_code,
    )
    raid_id: uuid.UUID = raid["raid_id"]

    po_id = await _person_id_by_role(seeded_for_mutation, "PortfolioOwner")
    await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        resource_type="programme_raid",
        resource_id=raid_id,
    )

    token = mint_token(user_id=dd_id, role="DeliveryDirector", ap_flag=True)
    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
        params={"resource_type": "programme_raid", "resource_id": str(raid_id)},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["total_count"] >= 1
    entry_resource_ids = [e["resource_id"] for e in body["items"]]
    assert str(raid_id) in entry_resource_ids


async def test_5a_broad_raid_in_unassigned_programme_not_visible(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """DD with AP cannot see audit row for a RAID in a programme not assigned to them."""
    dd_row = await seeded_for_mutation.fetchrow(
        "SELECT person_id FROM people WHERE role = 'DeliveryDirector' AND ap_flag = true LIMIT 1"
    )
    dd_id: uuid.UUID = dd_row["person_id"]

    unassigned = await seeded_for_mutation.fetchrow(
        "SELECT programme_code FROM programmes "
        "WHERE programme_code NOT IN ("
        "  SELECT programme_id FROM person_programme_assignments WHERE person_id = $1"
        ") LIMIT 1",
        dd_id,
    )
    unassigned_code: str = unassigned["programme_code"]

    raid = await seeded_for_mutation.fetchrow(
        "SELECT raid_id FROM programme_raids WHERE programme_code = $1 LIMIT 1",
        unassigned_code,
    )
    raid_id: uuid.UUID = raid["raid_id"]

    po_id = await _person_id_by_role(seeded_for_mutation, "PortfolioOwner")
    await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        resource_type="programme_raid",
        resource_id=raid_id,
    )

    token = mint_token(user_id=dd_id, role="DeliveryDirector", ap_flag=True)
    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
        params={"resource_type": "programme_raid", "resource_id": str(raid_id)},
    )
    assert r.status_code == 200
    assert r.json()["total_count"] == 0


async def test_5a_broad_milestone_in_assigned_programme_visible(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """DD with AP sees audit row for a milestone in their programme."""
    dd_row = await seeded_for_mutation.fetchrow(
        "SELECT person_id FROM people WHERE role = 'DeliveryDirector' AND ap_flag = true LIMIT 1"
    )
    dd_id: uuid.UUID = dd_row["person_id"]

    assigned = await seeded_for_mutation.fetchrow(
        "SELECT programme_id FROM person_programme_assignments WHERE person_id = $1 LIMIT 1",
        dd_id,
    )
    assigned_code: str = assigned["programme_id"]

    ms = await seeded_for_mutation.fetchrow(
        "SELECT milestone_id FROM programme_milestones WHERE programme_code = $1 LIMIT 1",
        assigned_code,
    )
    milestone_id: uuid.UUID = ms["milestone_id"]

    po_id = await _person_id_by_role(seeded_for_mutation, "PortfolioOwner")
    await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        resource_type="programme_milestone",
        resource_id=milestone_id,
    )

    token = mint_token(user_id=dd_id, role="DeliveryDirector", ap_flag=True)
    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
        params={"resource_type": "programme_milestone"},
    )
    assert r.status_code == 200
    assert r.json()["total_count"] >= 1


async def test_5a_broad_snapshot_in_assigned_programme_visible(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """DD with AP sees audit row for a health snapshot in their programme."""
    dd_row = await seeded_for_mutation.fetchrow(
        "SELECT person_id FROM people WHERE role = 'DeliveryDirector' AND ap_flag = true LIMIT 1"
    )
    dd_id: uuid.UUID = dd_row["person_id"]

    assigned = await seeded_for_mutation.fetchrow(
        "SELECT programme_id FROM person_programme_assignments WHERE person_id = $1 LIMIT 1",
        dd_id,
    )
    assigned_code: str = assigned["programme_id"]

    snap = await seeded_for_mutation.fetchrow(
        "SELECT snapshot_id FROM programme_health_snapshots WHERE programme_code = $1 LIMIT 1",
        assigned_code,
    )
    snapshot_id: uuid.UUID = snap["snapshot_id"]

    po_id = await _person_id_by_role(seeded_for_mutation, "PortfolioOwner")
    await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        resource_type="programme_health_snapshot",
        resource_id=snapshot_id,
    )

    token = mint_token(user_id=dd_id, role="DeliveryDirector", ap_flag=True)
    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
        params={"resource_type": "programme_health_snapshot"},
    )
    assert r.status_code == 200
    assert r.json()["total_count"] >= 1


async def test_5a_broad_po_sees_all(
    seeded_for_mutation: asyncpg.Connection,
    http_client: httpx.AsyncClient,
) -> None:
    """PO with AP still sees all audit rows; 5a-broad does not restrict PO."""
    po_id = await _person_id_by_role(seeded_for_mutation, "PortfolioOwner")

    raid = await seeded_for_mutation.fetchrow(
        "SELECT raid_id FROM programme_raids LIMIT 1"
    )
    raid_id: uuid.UUID = raid["raid_id"]

    await _insert_audit_row(
        seeded_for_mutation,
        actor_user_id=po_id,
        resource_type="programme_raid",
        resource_id=raid_id,
    )

    token = mint_token(user_id=po_id, role="PortfolioOwner", ap_flag=True)
    r = await http_client.get(
        "/api/v1/audit/search",
        headers={"Authorization": f"Bearer {token}"},
        params={"resource_type": "programme_raid"},
    )
    assert r.status_code == 200
    assert r.json()["total_count"] >= 1
