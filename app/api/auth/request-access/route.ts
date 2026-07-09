import { NextResponse } from "next/server";

import { submitAccessRequest } from "@/lib/auth-sheet";

export const runtime = "nodejs";

// Temporary request-access workflow that writes to the Google Apps Script request tab.
// This can later be replaced by a form backend, queue, or identity provider flow.
export async function POST(request: Request) {
  let body: {
    firstName?: string;
    lastName?: string;
    email?: string;
    organization?: string;
    reason?: string;
  } = {};

  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const organization = body.organization?.trim() ?? "";
  const reason = body.reason?.trim() ?? "";

  if (!firstName || !lastName || !email || !organization || !reason) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const result = await submitAccessRequest({
      firstName,
      lastName,
      email,
      organization,
      reason
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ...result,
          error: result.message || "Unable to submit your request right now."
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: result.message
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit your request right now."
      },
      { status: 409 }
    );
  }
}
