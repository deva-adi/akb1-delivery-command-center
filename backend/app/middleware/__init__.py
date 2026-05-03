"""Cross-cutting ASGI middleware (rate limit, CSRF, security headers).

Slice 5b introduces per-IP rate limiting (rate_limit) and CSRF double-
submit (csrf). Security headers PRD 03 section 14 lands later.
"""
