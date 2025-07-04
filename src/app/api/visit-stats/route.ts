import { NextResponse } from 'next/server';
import { getVisitStats } from '@/lib/database';

export async function GET() {
  try {
    const stats = await getVisitStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting visit stats:', error);
    return NextResponse.json({ error: 'Failed to get visit stats' }, { status: 500 });
  }
}