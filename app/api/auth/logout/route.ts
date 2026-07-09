import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, getSessionCookieOptions, sanitizeRedirectPath } from "@/lib/auth";

function clearSession(request: Request) {
  const url = new URL(request.url);
  const nextPath = sanitizeRedirectPath(url.searchParams.get("next"), "/login");
  const response = NextResponse.redirect(new URL(nextPath, request.url));

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getSessionCookieOptions(0),
    maxAge: 0
  });

  return response;
}

// Temporary logout endpoint for the simple email/password session.
// This can later be swapped for a provider-specific sign-out flow.
export async function GET(request: Request) {
  return clearSession(request);
}

export async function POST(request: Request) {
  return clearSession(request);
}
