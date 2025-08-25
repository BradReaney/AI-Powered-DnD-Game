import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'production'
    ? 'http://backend:5001'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001');

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const campaignId = searchParams.get('campaignId');

        if (!campaignId) {
            return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
        }

        const response = await fetch(`${BACKEND_URL}/api/sessions/active/continuity?campaignId=${campaignId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching active sessions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active sessions' },
            { status: 500 }
        );
    }
}
