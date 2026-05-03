"""Stateless double-submit CSRF middleware (PRD 03 section 9; slice 5b).

Defense-in-depth on top of the JWT-in-body auth path. The token is
issued as a cookie on successful login and the browser must echo the
same value in an X-CSRF-Token header on every state-mutating request.
Server-side state is zero: the check is a constant-time string compare
between the cookie and the header.

Surface:

  Verify on:   POST, PUT, PATCH, DELETE under /api/v1/* except the
               login endpoint (which is the token issuance point).

  Exempt from verify:  GET, HEAD, OPTIONS (idempotent), /health,
                       POST /api/v1/auth/login, anything not under
                       /api/v1/*.

  Issue on:    Successful 2xx response to POST /api/v1/auth/login.
               The cookie is set with HttpOnly=False (the browser JS
               must read the value to put it in the header for the
               double-submit pattern), SameSite=Strict, Secure=False
               in dev (operator flips for production).

Token shape: csrf_token_bytes urandom -> urlsafe base64 (no padding).
Default 32 bytes -> 43 ascii chars.
"""

from __future__ import annotations

import secrets
from base64 import urlsafe_b64encode
from typing import Final

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config import Settings


_DENIED_DETAIL: Final[str] = "CSRF token missing or invalid"
_LOGIN_PATH: Final[str] = "/api/v1/auth/login"
_MUTATING_METHODS: Final[frozenset[str]] = frozenset({"POST", "PUT", "PATCH", "DELETE"})


def generate_token(n_bytes: int) -> str:
    """Return a urlsafe base64 token of n_bytes entropy, padding stripped."""
    raw = secrets.token_bytes(n_bytes)
    return urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _is_protected(method: str, path: str) -> bool:
    if not path.startswith("/api/v1/"):
        return False
    if method.upper() not in _MUTATING_METHODS:
        return False
    if path == _LOGIN_PATH:
        return False
    return True


class CsrfMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, settings: Settings) -> None:
        super().__init__(app)
        self._settings = settings

    async def dispatch(self, request: Request, call_next):
        cookie_name = self._settings.csrf_cookie_name
        header_name = self._settings.csrf_header_name

        if _is_protected(request.method, request.url.path):
            cookie_value = request.cookies.get(cookie_name)
            header_value = request.headers.get(header_name)
            if (
                not cookie_value
                or not header_value
                or not secrets.compare_digest(cookie_value, header_value)
            ):
                return JSONResponse(
                    {"detail": _DENIED_DETAIL}, status_code=403
                )

        response = await call_next(request)

        # Mint and set on successful login. Never overwrite on other paths
        # so a long-lived browser session keeps its cookie across requests.
        if (
            request.method.upper() == "POST"
            and request.url.path == _LOGIN_PATH
            and 200 <= response.status_code < 300
        ):
            response.set_cookie(
                key=cookie_name,
                value=generate_token(self._settings.csrf_token_bytes),
                httponly=False,
                samesite="strict",
                secure=False,
                path="/",
            )

        return response
