/**
 * Edge middleware: gate /home/* on a valid akb1_session JWT.
 *
 * Logged-out user hitting /home or any sub-path is 302-redirected to
 * /login. A logged-in user hitting /login is 302-redirected to /home.
 * Other paths (api proxy routes, root) are pass-through.
 *
 * The middleware is convenience only. Backend remains authoritative on
 * every protected fetch (Security PRD section 6).
 */

import { NextResponse, type NextRequest } from "next/server";
import { decodeSessionToken } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/cookies";

const PROTECTED_PREFIX = "/home";
const LOGIN_PATH = "/login";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value ?? "";
  const user = token.length > 0 ? await decodeSessionToken(token) : null;

  if (pathname === LOGIN_PATH && user !== null) {
    const url = request.nextUrl.clone();
    url.pathname = PROTECTED_PREFIX;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(PROTECTED_PREFIX) && user === null) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/home/:path*"],
};
