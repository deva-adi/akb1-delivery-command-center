/**
 * Cookie shape for the Route Handler proxy auth flow.
 *
 * Two cookies are managed by the proxy:
 *   - akb1_session: JWT issued by the backend, stored httpOnly so client
 *     JavaScript cannot read it.
 *   - csrf_token: forwarded as-is from the backend's login response
 *     (HttpOnly=False per slice 5b D-041 ruling 11; the client must
 *     read it to put it in the X-CSRF-Token header on mutating calls).
 *
 * The Next.js proxy sets both cookies in one Set-Cookie pair on
 * successful POST /api/auth/login response. The middleware verifies
 * akb1_session on every protected route hit.
 */

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const SESSION_COOKIE = "akb1_session";
export const CSRF_COOKIE = "csrf_token";

export const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

type CookieAttrs = Partial<ResponseCookie>;

export function sessionCookieAttrs(): CookieAttrs {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  };
}

export function csrfCookieAttrs(): CookieAttrs {
  return {
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  };
}
