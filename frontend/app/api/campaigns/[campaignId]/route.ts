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
        const response = await fetch(`${backendUrl}/api/campaigns/${campaignId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Transform backend data to frontend format (same as main campaigns route)
        const transformedData = {
            ...data,
            id: data._id?.toString() || data.id || `campaign-${Math.random()}`
        };

        return NextResponse.json(transformedData);
    } catch (error) {
        console.error("Campaign get API route error:", error);
        return NextResponse.json(
            { error: "Failed to fetch campaign" },
            { status: 500 },
        );
    }
}

export async function PUT(
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

        // Get the request body
        const body = await request.json();

        // Forward the request to the backend
        const response = await fetch(`${backendUrl}/api/campaigns/${campaignId}`, {
            method: "PUT",
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

        // Transform backend data to frontend format (same as main campaigns route)
        const transformedData = {
            ...data,
            id: data._id?.toString() || data.id || `campaign-${Math.random()}`
        };

        return NextResponse.json(transformedData);
    } catch (error) {
        console.error("Campaign update API route error:", error);
        return NextResponse.json(
            { error: "Failed to update campaign" },
            { status: 500 },
        );
    }
}

export async function DELETE(
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
        const response = await fetch(`${backendUrl}/api/campaigns/${campaignId}`, {
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

        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Campaign delete API route error:", error);
        return NextResponse.json(
            { error: "Failed to delete campaign" },
            { status: 500 },
        );
    }
}
