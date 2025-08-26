import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { campaignId: string } }
) {
    try {
        const { campaignId } = params;

        // Get backend URL for server-side requests (use service name in Docker)
        const backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
            throw new Error('BACKEND_URL environment variable is required');
        }

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/api/locations/campaign/${campaignId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Transform backend data to frontend format (same as campaigns route)
        const transformedLocations = Array.isArray(data) ? data.map(location => ({
            ...location,
            id: location._id?.toString() || location.id || `location-${Math.random()}`
        })) : data;

        return NextResponse.json(transformedLocations);
    } catch (error) {
        console.error("Locations by campaign API route error:", error);
        return NextResponse.json(
            { error: "Failed to fetch locations by campaign" },
            { status: 500 },
        );
    }
}
