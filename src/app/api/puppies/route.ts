import { NextRequest, NextResponse } from 'next/server';
import { getAllPuppies, getDogs, initializeDatabase, addPuppy } from '@/lib/database';

export async function GET() {
  try {
    await initializeDatabase();

    const [puppies, dogs] = await Promise.all([
      getAllPuppies(),
      getDogs()
    ]);

    return NextResponse.json({
      puppies,
      dam: dogs.dam,
      sire: dogs.sire
    });
  } catch (error) {
    console.error('Error fetching puppies:', error);
    return NextResponse.json({ error: 'Failed to fetch puppies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, images } = await request.json();

    if (!name || !images) {
      return NextResponse.json({ error: 'Name and images are required' }, { status: 400 });
    }

    const puppyId = await addPuppy(name, images, false);

    return NextResponse.json({ success: true, id: puppyId });
  } catch (error) {
    console.error('Error adding puppy:', error);
    return NextResponse.json({ error: 'Failed to add puppy' }, { status: 500 });
  }
}