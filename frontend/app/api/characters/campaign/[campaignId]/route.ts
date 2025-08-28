import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  try {
    // Get backend URL for server-side requests (use service name in Docker)
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is required");
    }

    // Forward the request to the backend
    const response = await fetch(
      `${backendUrl}/api/characters/campaign/${(await params).campaignId}`,
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

    // Transform backend data to frontend format
    const transformedData = Array.isArray(data)
      ? data.map((char) => ({
          ...char,
          id: char._id?.toString() || char.id || `char-${Math.random()}`,
          campaignId: char.campaignId?.toString() || char.campaignId,
        }))
      : data;

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Characters by campaign API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 },
    );
  }
}
