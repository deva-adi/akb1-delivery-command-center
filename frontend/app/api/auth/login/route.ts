/**
 * Login proxy.
 *
 * Q2 ruling at M7 scaffold kickoff: Route Handler proxy is the auth path
 * for the scaffold. NextAuth is deferred to Phase 2 OAuth (D-016 path).
 * When Phase 2 lands, replace this Route Handler with a NextAuth
 * credentials provider whose authorize callback calls POST
 * /api/v1/auth/login on the backend and stuffs the returned JWT into the
 * NextAuth session. Until then, this proxy is the entire auth surface.
 *
 * Responsibilities:
 *   1. Forward {email, password} to backend POST /api/v1/auth/login.
 *   2. On 200, plant the backend-issued JWT in the akb1_session cookie
 *      (httpOnly, SameSite=Strict). Forward the backend's csrf_token
 *      cookie (HttpOnly=False per slice 5b D-041 ruling 11).
 *   3. On 401 / 422 / 429, return a clean error envelope to the client.
 *   4. Never echo the JWT or password back in the response body.
 */

import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  CSRF_COOKIE,
  SESSION_COOKIE,
  csrfCookieAttrs,
  sessionCookieAttrs,
} from "@/lib/auth/cookies";

interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
}

interface BackendLoginResponse {
  access_token: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: LoginRequestBody;
  try {
    payload = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json(
      { detail: "Invalid request body" },
      { status: 400 },
    );
  }

  if (typeof payload.email !== "string" || typeof payload.password !== "string") {
    return NextResponse.json(
      { detail: "Email and password are required" },
      { status: 422 },
    );
  }

  const upstream = await fetch(`${env.backendApiUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
    cache: "no-store",
  });

  if (!upstream.ok) {
    const retryAfter = upstream.headers.get("retry-after");
    let detail = "Sign-in failed";
    try {
      const body = (await upstream.json()) as { detail?: string };
      if (typeof body.detail === "string") {
        detail = body.detail;
      }
    } catch {
      // body was not JSON
    }
    const errorResponse = NextResponse.json(
      { detail, retryAfter },
      { status: upstream.status },
    );
    if (retryAfter !== null) {
      errorResponse.headers.set("Retry-After", retryAfter);
    }
    return errorResponse;
  }

  const body = (await upstream.json()) as BackendLoginResponse;
  if (typeof body.access_token !== "string" || body.access_token.length === 0) {
    return NextResponse.json(
      { detail: "Backend returned no access token" },
      { status: 502 },
    );
  }

  const csrfFromBackend = readCsrfFromUpstream(upstream.headers);

  const ok = NextResponse.json({ ok: true });
  ok.cookies.set({
    name: SESSION_COOKIE,
    value: body.access_token,
    ...sessionCookieAttrs(),
  });
  if (csrfFromBackend !== null) {
    ok.cookies.set({
      name: CSRF_COOKIE,
      value: csrfFromBackend,
      ...csrfCookieAttrs(),
    });
  }
  return ok;
}

function readCsrfFromUpstream(headers: Headers): string | null {
  const setCookies = headers.getSetCookie?.() ?? [];
  for (const raw of setCookies) {
    const [first] = raw.split(";");
    if (first === undefined) continue;
    const eq = first.indexOf("=");
    if (eq <= 0) continue;
    const name = first.slice(0, eq).trim();
    const value = first.slice(eq + 1).trim();
    if (name === CSRF_COOKIE && value.length > 0) {
      return value;
    }
  }
  return null;
}
