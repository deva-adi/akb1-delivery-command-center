/**
 * Runtime configuration for the frontend.
 *
 * BACKEND_API_URL is the only server-side dependency the Route Handler
 * proxy and Server Components need to reach FastAPI. NEXT_PUBLIC_* vars
 * would leak to the client bundle; we deliberately do not expose the
 * backend URL there because all traffic goes through the Next.js proxy.
 *
 * JWT_SECRET is read lazily inside lib/auth/session.ts (not here) so
 * tests can override process.env between test runs without touching a
 * cached module-level constant.
 */
const BACKEND_API_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export const env = {
  backendApiUrl: BACKEND_API_URL,
} as const;
