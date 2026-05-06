"""Shared helpers for integration tests."""

from __future__ import annotations

import sys
from pathlib import Path


_BACKEND_DIR = Path(__file__).resolve().parents[2]


def reset_schema_via_alembic() -> None:
    """Sync helper: `alembic downgrade base; alembic upgrade head`.

    Used by the seed-determinism test to drop and recreate the schema
    between two seed runs. Sync because alembic env.py runs `asyncio.run`
    internally to drive the async migration runner; calling this from an
    async context requires `asyncio.to_thread` so the alembic invocation
    happens in a thread with no current event loop.
    """
    if str(_BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(_BACKEND_DIR))

    from alembic import command  # noqa: PLC0415
    from alembic.config import Config  # noqa: PLC0415

    cfg = Config(str(_BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(_BACKEND_DIR / "alembic"))
    command.downgrade(cfg, "base")
    command.upgrade(cfg, "head")


OWNER_DSN = "postgresql://akb1_owner:akb1_owner_password@localhost:5432/akb1_dcc"
APP_DSN = "postgresql://akb1_app:akb1_app_password@localhost:5432/akb1_dcc"
