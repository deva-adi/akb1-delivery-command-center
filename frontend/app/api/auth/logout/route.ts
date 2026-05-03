/**
 * Logout proxy.
 *
 * Clears both cookies. The backend has no /auth/logout endpoint at slice
 * 5c; logout is purely a frontend cookie wipe. When backend-side session
 * revocation lands, this Route Handler also calls the revocation endpoint.
 */

import { NextResponse } from "next/server";
import { CSRF_COOKIE, SESSION_COOKIE } from "@/lib/auth/cookies";

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: CSRF_COOKIE,
    value: "",
    httpOnly: false,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
