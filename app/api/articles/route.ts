import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ARTICLES_CSV_URL = process.env.ARTICLES_CSV_URL?.trim();

export async function GET() {
  if (!ARTICLES_CSV_URL) {
    return NextResponse.json(
      {
        error:
          "ARTICLES_CSV_URL is not configured. Add the published Articles Cataloged CSV URL to your environment variables."
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(ARTICLES_CSV_URL, {
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to load articles: ${response.status}` },
        { status: 502 }
      );
    }

    const csvText = await response.text();
    return new NextResponse(csvText, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load articles right now."
      },
      { status: 502 }
    );
  }
}
