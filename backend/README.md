# Backend

FastAPI application. M6 in progress.

## Python version lock

Pinned to Python 3.12 for v1.0.0. PROJECT_MANIFEST section 7 lists "3.12 or 3.14" as accepted; we are running 3.12 because the Rust-based `pydantic-core` shipped by Pydantic v2 is built against PyO3 with a maximum supported Python of 3.13, and `greenlet` (a transitive dependency of SQLAlchemy async) does not yet publish an arm64 wheel for Python 3.14 on macOS. Both will be revisited when upstream wheels land. Until then, use the explicit `python3.12` interpreter for the venv. The Dockerfile already targets `python:3.12-slim`.

```
python3.12 -m venv .venv
.venv/bin/pip install -r requirements.txt
PYTHONPATH=. .venv/bin/pytest -v
```

## Layout

```
backend/
  app/
    main.py             FastAPI app entry, mounts /health and /api/v1 routers
    config.py           pydantic-settings; loads .env, exposes get_settings()
    db.py               Async SQLAlchemy engine, session factory, Base
    api/v1/             Route modules per surface
    auth/               JWT validation, require_role dependency
    models/             SQLAlchemy ORM models, one file per entity cluster
    schemas/            Pydantic request and response schemas
    services/           Business logic, audited operations
    seed/               Deterministic seed generator (SEED=20260424)
    intelligence/       What/Why/Act rules engine, one module per tab
  alembic/              Alembic migrations (added in slice 2.3)
  alembic.ini
  tests/
    unit/               Fast tests, no external dependencies
    integration/        Tests against Postgres in docker-compose
    regression/         Drill integrity and cross-cutting invariants
  Dockerfile
  pyproject.toml
  requirements.txt
```

## Two database roles

Per D-036, the backend uses two Postgres roles to enforce the audit append-only invariant.

| Role | Purpose | Privileges |
|------|---------|------------|
| `akb1_owner` | Alembic migrations, owns the schema | Full DDL on `public`. NOT a Postgres superuser, so subject to FORCE ROW LEVEL SECURITY which blocks it from UPDATE and DELETE on `audit_trail_entries` |
| `akb1_app` | FastAPI runtime connection user | SELECT and INSERT on `audit_trail_entries`. No UPDATE. No DELETE. Read and write on other tables per the access matrix in `01_PRD_Data_Model.md` section 3.1.10 |

Both roles are created by `infra/postgres/init/01_create_roles.sql` on first cluster init. The bootstrap superuser (`POSTGRES_USER`) is used only to create those two roles; application code never connects as the bootstrap superuser.

## Status at slice 2.1 close

Backend scaffold green, /health 200, pytest 2/2 passed.
