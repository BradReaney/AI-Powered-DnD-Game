import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get backend URL for server-side requests (use service name in Docker)
    const backendUrl = process.env.BACKEND_URL || "http://backend:5001";

    // Get the campaign ID from the query parameters
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    let endpoint = "/api/locations";
    if (campaignId) {
      endpoint = `/api/locations/campaign/${campaignId}`;
    }

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Extract locations array from the response if it's wrapped in an object
    if (data.success && data.locations) {
      return NextResponse.json(data.locations);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Locations API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get backend URL for server-side requests (use service name in Docker)
    const backendUrl = process.env.BACKEND_URL || "http://backend:5001";

    // Get the request body
    const body = await request.json();

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/locations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Backend responded with status: ${response.status}: ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Locations API route error:", error);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 },
    );
  }
}
