"""bcrypt password hashing.

Uses bcrypt directly (passlib 1.7.4 has compat issues with bcrypt 5.x).
Cost factor is configurable: tests run at 4 (fast), production at 12 (slow
enough to deter offline attack). Set BCRYPT_ROUNDS env var to override.

Seed determinism: the seed generator embeds a precomputed bcrypt hash
literal so two seed runs produce byte-identical output. Generating a hash
with bcrypt.gensalt() is non-deterministic by design (random salt) and
cannot be used inside the seed.
"""

from __future__ import annotations

import os

import bcrypt


def _rounds() -> int:
    raw = os.getenv("BCRYPT_ROUNDS", "12")
    try:
        n = int(raw)
    except ValueError:
        n = 12
    if n < 4 or n > 16:
        n = 12
    return n


def hash_password(plain: str) -> str:
    """Hash a plaintext password with bcrypt. Returns the encoded hash string."""
    if len(plain.encode("utf-8")) > 72:
        # bcrypt 5.x hard-rejects passwords longer than 72 bytes. Slice this
        # at the boundary so callers get a clear error.
        raise ValueError("password exceeds bcrypt 72-byte limit")
    salt = bcrypt.gensalt(rounds=_rounds())
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Constant-time bcrypt verify. Returns False on any error (incl. malformed
    hash) so callers can treat the result as a uniform bool."""
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False
