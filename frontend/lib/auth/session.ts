/**
 * Server-side JWT decode and current-user resolution.
 *
 * The Route Handler proxy plants the backend-issued JWT in the
 * akb1_session httpOnly cookie. middleware.ts and Server Components
 * read the cookie, verify the signature against JWT_SECRET (shared with
 * the backend), and surface the decoded claims as a CurrentUser shape.
 *
 * Verification uses jose's jwtVerify which is Edge-runtime compatible
 * (next/server middleware runs on Edge by default).
 */

import { jwtVerify, type JWTPayload } from "jose";
import { isKnownRole, type Role } from "@/lib/auth/role-nav";

export interface CurrentUser {
  userId: string;
  role: Role;
  apFlag: boolean;
}

interface BackendJwtClaims extends JWTPayload {
  sub?: string;
  role?: string;
  ap_flag?: boolean;
}

function secretBytes(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "";
  if (secret.length === 0) {
    throw new Error("JWT_SECRET not configured for the frontend process");
  }
  return new TextEncoder().encode(secret);
}

export async function decodeSessionToken(token: string): Promise<CurrentUser | null> {
  if (token.length === 0) return null;

  let payload: BackendJwtClaims;
  try {
    const verified = await jwtVerify(token, secretBytes(), {
      algorithms: ["HS256"],
    });
    payload = verified.payload as BackendJwtClaims;
  } catch {
    return null;
  }

  const sub = payload.sub;
  const role = payload.role;
  if (typeof sub !== "string" || sub.length === 0) return null;
  if (typeof role !== "string" || !isKnownRole(role)) return null;

  return {
    userId: sub,
    role,
    apFlag: payload.ap_flag === true,
  };
}
