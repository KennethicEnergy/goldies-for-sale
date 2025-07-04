import { NextRequest, NextResponse } from 'next/server';
import { trackVisit } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { pageVisited = 'home' } = await request.json();

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';

    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Track the visit
    await trackVisit(ip, userAgent, pageVisited);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking visit:', error);
    return NextResponse.json({ error: 'Failed to track visit' }, { status: 500 });
  }
}