import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions
} from "@/lib/auth";
import { getApprovedUserForLogin } from "@/lib/auth-sheet";

export const runtime = "nodejs";

// Temporary email/password auth backed by the Google Apps Script credential store.
// This can later be replaced with Google OAuth, Auth0, Microsoft Entra ID,
// AWS Cognito, or another identity provider without changing the protected routes.
export async function POST(request: Request) {
  let body: {
    email?: string;
    password?: string;
    next?: string;
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  if (!sessionSecret) {
    return NextResponse.json(
      { error: "SESSION_SECRET is not configured." },
      { status: 500 }
    );
  }

  try {
    const user = await getApprovedUserForLogin({ email, password });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials or inactive account." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      redirectTo: "/profile"
    });

    response.cookies.set(
      AUTH_COOKIE_NAME,
      await createSessionToken(user.email, sessionSecret, {
        firstName: user.firstName,
        lastName: user.lastName,
        organization: user.organization,
        active: user.active
      }),
      getSessionCookieOptions()
    );

    return response;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("email not found") ||
        error.message.includes("incorrect password") ||
        error.message.includes("account inactive") ||
        error.message.includes("invalid credentials"))
    ) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Authentication is temporarily unavailable."
      },
      { status: 500 }
    );
  }
}
