import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { locationId: string } },
) {
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is required");
    }

    const { locationId } = params;
    if (!locationId) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 },
      );
    }

    const response = await fetch(`${backendUrl}/api/locations/${locationId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Backend responded with status: ${response.status}: ${JSON.stringify(errorData)}`,
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Location DELETE API route error:", error);
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 },
    );
  }
}
