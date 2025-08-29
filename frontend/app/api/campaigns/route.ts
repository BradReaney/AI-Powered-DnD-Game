import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get backend URL for server-side requests (use service name in Docker)
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is required");
    }

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/campaigns`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Transform backend data to frontend format
    const transformedData = Array.isArray(data)
      ? data.map((campaign) => ({
          ...campaign,
          id:
            campaign._id?.toString() ||
            campaign.id ||
            `campaign-${Math.random()}`,
        }))
      : data;

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Campaigns API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is required");
    }

    const response = await fetch(`${backendUrl}/api/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to create campaign" },
        { status: response.status },
      );
    }

    const data = await response.json();

    // Transform backend data to frontend format (same as GET route)
    const transformedData = {
      ...data,
      id: data._id?.toString() || data.id || `campaign-${Math.random()}`,
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
