import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  try {
    const BACKEND_URL = process.env.BACKEND_URL;
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: "BACKEND_URL environment variable is required" },
        { status: 500 },
      );
    }

    const { sessionId } = params;

    const response = await fetch(
      `${BACKEND_URL}/api/sessions/${sessionId}/activity`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating session activity:", error);
    return NextResponse.json(
      { error: "Failed to update session activity" },
      { status: 500 },
    );
  }
}
