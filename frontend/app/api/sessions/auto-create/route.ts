import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const BACKEND_URL = process.env.BACKEND_URL;
    if (!BACKEND_URL) {
      throw new Error("BACKEND_URL environment variable is required");
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/sessions/auto-create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating automatic session:", error);
    return NextResponse.json(
      { error: "Failed to create automatic session" },
      { status: 500 },
    );
  }
}
