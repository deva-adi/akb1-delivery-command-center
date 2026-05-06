"""audit_trail_entries append-only invariant.

Per Test Plan 14 sections 3.2 and 3.3 plus the slice 2.3 reinforcement, the
invariant must hold against three concurrent attack surfaces:

  1. akb1_app (application role) cannot UPDATE or DELETE
  2. akb1_owner (table owner role) cannot UPDATE or DELETE despite ownership
  3. INSERT works for both roles

The role_conn fixture parametrises across both roles so each test runs once
per role. Postgres true SUPERUSER bypass is out of scope (operational
mitigation: no application path connects as the bootstrap superuser).
"""

from __future__ import annotations

import uuid

import asyncpg
import pytest


pytestmark = pytest.mark.integration


async def _seed_person(conn: asyncpg.Connection) -> uuid.UUID:
    person_id = uuid.uuid4()
    await conn.execute(
        "INSERT INTO people (person_id, email, full_name, role) "
        "VALUES ($1, $2, $3, $4)",
        person_id,
        f"audit-test-{uuid.uuid4().hex}@test.local",
        "Audit Test User",
        "PortfolioOwner",
    )
    return person_id


async def _seed_audit_row(
    conn: asyncpg.Connection,
    person_id: uuid.UUID,
) -> uuid.UUID:
    entry_id = uuid.uuid4()
    await conn.execute(
        """
        INSERT INTO audit_trail_entries (
            entry_id, actor_user_id, actor_role, endpoint, http_method,
            occurred_at, outcome, resource_type, before_json, after_json
        ) VALUES (
            $1, $2, 'PortfolioOwner', '/api/v1/test', 'PATCH',
            NOW(), 'Success', 'test', $3::jsonb, $4::jsonb
        )
        """,
        entry_id,
        person_id,
        '{"a": 1}',
        '{"a": 2}',
    )
    return entry_id


def _looks_like_append_only_block(err: BaseException) -> bool:
    """Either REVOKE (privilege denied) or RLS (no matching policy) is OK."""
    msg = str(err).lower()
    return (
        "permission denied" in msg
        or "row-level security" in msg
        or "row security" in msg
    )


async def test_audit_update_blocked(role_conn: asyncpg.Connection) -> None:
    tr = role_conn.transaction()
    await tr.start()
    try:
        person_id = await _seed_person(role_conn)
        entry_id = await _seed_audit_row(role_conn, person_id)
        with pytest.raises(asyncpg.exceptions.PostgresError) as exc:
            await role_conn.execute(
                "UPDATE audit_trail_entries SET outcome = 'Denied' "
                "WHERE entry_id = $1",
                entry_id,
            )
        assert _looks_like_append_only_block(exc.value), (
            f"expected privilege or RLS denial, "
            f"got {type(exc.value).__name__}: {exc.value}"
        )
    finally:
        await tr.rollback()


async def test_audit_delete_blocked(role_conn: asyncpg.Connection) -> None:
    tr = role_conn.transaction()
    await tr.start()
    try:
        person_id = await _seed_person(role_conn)
        entry_id = await _seed_audit_row(role_conn, person_id)
        with pytest.raises(asyncpg.exceptions.PostgresError) as exc:
            await role_conn.execute(
                "DELETE FROM audit_trail_entries WHERE entry_id = $1",
                entry_id,
            )
        assert _looks_like_append_only_block(exc.value), (
            f"expected privilege or RLS denial, "
            f"got {type(exc.value).__name__}: {exc.value}"
        )
    finally:
        await tr.rollback()


async def test_audit_insert_works(role_conn: asyncpg.Connection) -> None:
    tr = role_conn.transaction()
    await tr.start()
    try:
        person_id = await _seed_person(role_conn)
        entry_id = await _seed_audit_row(role_conn, person_id)
        row = await role_conn.fetchrow(
            "SELECT entry_id, before_json, after_json "
            "FROM audit_trail_entries WHERE entry_id = $1",
            entry_id,
        )
        assert row is not None
        assert row["entry_id"] == entry_id
        assert row["before_json"] == '{"a": 1}'
        assert row["after_json"] == '{"a": 2}'
    finally:
        await tr.rollback()
