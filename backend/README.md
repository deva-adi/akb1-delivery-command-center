# Backend

FastAPI application. Populated at Milestone M6.

## Planned structure

```
backend/
|-- app/
|   |-- main.py                    FastAPI app entry
|   |-- api/v1/                    Routers per tab
|   |-- models/                    SQLAlchemy models
|   |-- schemas/                   Pydantic schemas
|   |-- services/                  Business logic
|   |-- intelligence/              What Why Act engine
|   |   |-- engine.py
|   |   +-- rules/                 One file per tab
|   |-- auth/                      RBAC, NextAuth integration
|   +-- seed/                      Deterministic seed generator
|-- tests/
|   |-- unit/
|   |-- integration/
|   +-- regression/                Includes drill integrity suite
|-- requirements.txt
+-- Dockerfile
```

## Status at 2026-04-24

Empty scaffold. Folder structure in place with .gitkeep markers. Real code lands at M6.

## Dependencies planned

FastAPI, Pydantic v2, SQLAlchemy 2, asyncpg, Alembic, pytest, schemathesis, pydantic-settings, python-jose, passlib, httpx for LLM calls.

---

*Folder owner: backend-dev subagent (M6 onward).*
