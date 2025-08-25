import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: { campaignId: string } }
) {
    try {
        // Get backend URL for server-side requests
        const backendUrl = process.env.BACKEND_URL;
        if (!backendUrl) {
            throw new Error('BACKEND_URL environment variable is required');
        }

        // Get the request body
        const body = await request.json();

        console.log(`Attempting to connect to backend at: ${backendUrl}`);
        console.log(`Campaign ID: ${params.campaignId}`);
        console.log(`Request body:`, body);

        // Forward the request to the backend with timeout and better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch(`${backendUrl}/api/campaigns/${params.campaignId}/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
            console.error(`Backend responded with status: ${response.status}:`, errorData);
            throw new Error(
                `Backend responded with status: ${response.status}: ${JSON.stringify(errorData)}`,
            );
        }

        const data = await response.json();
        console.log('Backend response received successfully:', data);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Campaign initialization API route error:", error);
        
        // Provide more detailed error information
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return NextResponse.json(
                    { error: "Backend connection timeout - service may be unavailable" },
                    { status: 503 }
                );
            }
            if (error.message.includes('ECONNRESET') || error.message.includes('fetch failed')) {
                return NextResponse.json(
                    { error: "Backend connection failed - service may be down or unreachable" },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to initialize campaign", details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
