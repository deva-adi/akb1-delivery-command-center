/**
 * Server-side fetch wrapper for backend calls.
 *
 * Used by Server Components and Route Handlers; the client never reaches
 * the backend directly. The wrapper attaches the Bearer token from the
 * akb1_session cookie and forwards the csrf_token cookie value as the
 * X-CSRF-Token header on mutating methods so the backend's CSRF
 * middleware (slice 5b D-041) is satisfied.
 *
 * Error mapping is intentionally narrow at scaffold time. A future slice
 * adds typed error subclasses for 401, 403, 404, 422, 429.
 */

import { cookies } from "next/headers";
import { SESSION_COOKIE, CSRF_COOKIE } from "@/lib/auth/cookies";
import { env } from "@/lib/env";

export interface BackendCallOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  attachAuth?: boolean;
}

export class BackendError extends Error {
  override readonly name = "BackendError";
  constructor(
    public readonly status: number,
    public readonly detail: string,
    public readonly retryAfter: string | null,
  ) {
    super(`Backend ${status}: ${detail}`);
  }
}

export async function callBackend<T>(
  path: string,
  options: BackendCallOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const attachAuth = options.attachAuth ?? true;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (attachAuth) {
    const jar = cookies();
    const session = jar.get(SESSION_COOKIE)?.value;
    if (session) {
      headers["Authorization"] = `Bearer ${session}`;
    }
    if (method !== "GET") {
      const csrf = jar.get(CSRF_COOKIE)?.value;
      if (csrf) {
        headers["X-CSRF-Token"] = csrf;
        headers["Cookie"] = `${CSRF_COOKIE}=${csrf}`;
      }
    }
  }

  const url = `${env.backendApiUrl}${path}`;
  const response = await fetch(url, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const errorBody = (await response.json()) as { detail?: string };
      if (typeof errorBody.detail === "string") {
        detail = errorBody.detail;
      }
    } catch {
      // body was not JSON; keep statusText
    }
    throw new BackendError(
      response.status,
      detail,
      response.headers.get("retry-after"),
    );
  }

  return (await response.json()) as T;
}
