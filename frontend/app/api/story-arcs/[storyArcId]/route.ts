import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function GET(
  request: NextRequest,
  { params }: { params: { storyArcId: string } }
) {
  try {
    const response = await fetch(`${API_URL}/api/story-arcs/${params.storyArcId}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching story arc:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch story arc' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { storyArcId: string } }
) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/api/story-arcs/${params.storyArcId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating story arc:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update story arc' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { storyArcId: string } }
) {
  try {
    const response = await fetch(`${API_URL}/api/story-arcs/${params.storyArcId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting story arc:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete story arc' },
      { status: 500 }
    );
  }
}
