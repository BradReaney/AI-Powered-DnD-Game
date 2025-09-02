import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const BACKEND_URL = process.env.BACKEND_URL;
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: "BACKEND_URL environment variable is required" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/sessions/active?campaignId=${campaignId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform the response to match the expected frontend structure
    // Backend returns { sessions: [...] } but frontend expects { activeSessions: [...] }
    return NextResponse.json({
      activeSessions: data.sessions || [],
      message: data.message,
      campaignId: data.campaignId,
      count: data.count,
    });
  } catch (error) {
    console.error("Error fetching active sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch active sessions" },
      { status: 500 },
    );
  }
}
