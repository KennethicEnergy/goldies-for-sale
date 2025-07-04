import { NextResponse } from 'next/server';
import { resetToOriginalImages } from '@/lib/database';

export async function POST() {
  try {
    await resetToOriginalImages();
    return NextResponse.json({ success: true, message: 'Database reset to original images successfully' });
  } catch (error) {
    console.error('Error resetting images:', error);
    return NextResponse.json({ error: 'Failed to reset images' }, { status: 500 });
  }
}