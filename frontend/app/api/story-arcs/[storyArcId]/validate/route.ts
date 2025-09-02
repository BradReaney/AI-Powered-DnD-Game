import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function POST(
  request: NextRequest,
  { params }: { params: { storyArcId: string } }
) {
  try {
    const response = await fetch(`${API_URL}/api/story-arcs/${params.storyArcId}/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error validating story arc:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to validate story arc' },
      { status: 500 }
    );
  }
}
