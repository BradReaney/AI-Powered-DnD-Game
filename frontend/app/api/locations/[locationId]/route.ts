import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { locationId: string } },
) {
  try {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new Error("BACKEND_URL environment variable is required");
    }

    const { locationId } = params;
    const body = await request.json();

    const response = await fetch(`${backendUrl}/api/locations/${locationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Transform backend data to frontend format
    const transformedData = data
      ? {
          ...data,
          location: data.location
            ? {
                ...data.location,
                id:
                  data.location._id?.toString() ||
                  data.location.id ||
                  locationId,
              }
            : data.location,
        }
      : data;

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error updating location:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update location" },
      { status: 500 },
    );
  }
}

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
