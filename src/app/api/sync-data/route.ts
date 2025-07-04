import { NextResponse } from 'next/server';
import { syncAllData } from '@/lib/database';

export async function POST() {
  try {
    await syncAllData();
    return NextResponse.json({ success: true, message: 'All data synced successfully' });
  } catch (error) {
    console.error('Error syncing data:', error);
    return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 });
  }
}