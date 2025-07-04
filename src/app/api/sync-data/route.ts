import { NextResponse } from 'next/server';
import { addNewImagesIncrementally } from '@/lib/database';

export async function POST() {
  try {
    await addNewImagesIncrementally();
    return NextResponse.json({ success: true, message: 'New images added incrementally' });
  } catch (error) {
    console.error('Error adding images incrementally:', error);
    return NextResponse.json({ error: 'Failed to add images incrementally' }, { status: 500 });
  }
}