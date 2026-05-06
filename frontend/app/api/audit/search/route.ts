/**
 * Audit search proxy.
 *
 * Forwards GET /api/audit/search?{params} to the backend
 * GET /api/v1/audit/search with the session Bearer token.
 * Used by the AuditActivityStream client component for filter
 * changes and load-more pagination without exposing the backend
 * URL or the httpOnly session cookie to browser JS.
 *
 * GET requests carry no CSRF token (backend CSRF middleware exempts GET).
 * 403 and 401 responses from the backend are forwarded as-is so the client
 * can render the appropriate AP-required or unauthenticated message.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { env } from "@/lib/env";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = cookies().get(SESSION_COOKIE)?.value;
  if (!session) {
    return NextResponse.json({ detail: "Unauthenticated" }, { status: 401 });
  }

  const inboundUrl = new URL(request.url);
  const backendUrl = `${env.backendApiUrl}/api/v1/audit/search${inboundUrl.search}`;

  let upstream: Response;
  try {
    upstream = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${session}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ detail: "Backend unavailable" }, { status: 502 });
  }

  const body = (await upstream.json()) as unknown;
  return NextResponse.json(body, { status: upstream.status });
}
