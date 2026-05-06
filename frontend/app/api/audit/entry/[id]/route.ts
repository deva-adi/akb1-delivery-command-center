/**
 * Audit entry detail proxy.
 *
 * Forwards GET /api/audit/entry/{id} to the backend
 * GET /api/v1/audit/entry/{entry_id} with the session Bearer token.
 * Used by the AuditActivityStream client component when the user expands
 * a row to view the full before/after JSON and diff.
 *
 * Strict AP is enforced by the backend (require_audit_access strict_ap=True).
 * A 403 from the backend means the caller lacks the AP flag; the client renders
 * an "Audit Permission required" inline message instead of the diff view.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { env } from "@/lib/env";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = cookies().get(SESSION_COOKIE)?.value;
  if (!session) {
    return NextResponse.json({ detail: "Unauthenticated" }, { status: 401 });
  }

  const entryId = params.id;
  const backendUrl = `${env.backendApiUrl}/api/v1/audit/entry/${entryId}`;

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
