import { NextRequest, NextResponse } from 'next/server';
import { updatePuppyStatus } from '@/lib/database';

export async function PATCH(request: NextRequest) {
  try {
    const { isSold } = await request.json();
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const puppyId = parseInt(id || '0', 10);

    await updatePuppyStatus(puppyId, isSold);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating puppy:', error);
    return NextResponse.json({ error: 'Failed to update puppy' }, { status: 500 });
  }
}