import { NextRequest, NextResponse } from 'next/server';
import { updatePuppyStatus } from '@/lib/database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isSold } = await request.json();
    const puppyId = parseInt(params.id);

    await updatePuppyStatus(puppyId, isSold);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating puppy:', error);
    return NextResponse.json({ error: 'Failed to update puppy' }, { status: 500 });
  }
}