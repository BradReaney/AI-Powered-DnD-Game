import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { campaignId: string } }
) {
    try {
        // Get backend URL for server-side requests (use service name in Docker)
        const backendUrl = process.env.BACKEND_URL || "http://backend:5001";

        // Get the request body
        const body = await request.json();

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/api/campaigns/${params.campaignId}/initialize`, {
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
        console.error("Campaign initialization API route error:", error);
        return NextResponse.json(
            { error: "Failed to initialize campaign" },
            { status: 500 },
        );
    }
}
