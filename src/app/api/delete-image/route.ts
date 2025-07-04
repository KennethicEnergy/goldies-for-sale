import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { removePuppyImage } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { imagePath, puppyId } = await request.json();
    if (!imagePath) {
      return NextResponse.json({ error: 'No image path provided' }, { status: 400 });
    }
    const filePath = join(process.cwd(), 'public', imagePath.replace(/^\//, ''));
    await unlink(filePath);
    if (puppyId) {
      await removePuppyImage(Number(puppyId), imagePath);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}