import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = await verifySessionToken(sessionToken, process.env.SESSION_SECRET ?? "");

  if (session) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/lesson-plans",
    "/lesson-plans/:path*",
    "/articles",
    "/articles/:path*",
    "/profile",
    "/profile/:path*"
  ]
};
