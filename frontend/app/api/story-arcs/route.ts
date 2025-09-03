import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.BACKEND_URL || "http://backend:5001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/story-arcs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Transform backend data to frontend format (same pattern as campaigns)
    const transformedData = data
      ? {
          ...data,
          id: data._id?.toString() || data.id || `story-arc-${Math.random()}`,
        }
      : data;

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error creating story arc:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create story arc" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { success: false, message: "Campaign ID is required" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${API_URL}/api/story-arcs/campaign/${campaignId}`,
    );
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Transform backend data to frontend format (same pattern as campaigns)
    const transformedData = data
      ? {
          ...data,
          id: data._id?.toString() || data.id || `story-arc-${Math.random()}`,
        }
      : data;

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching story arc:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch story arc" },
      { status: 500 },
    );
  }
}
