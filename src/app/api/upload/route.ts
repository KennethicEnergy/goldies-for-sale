import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const folder = formData.get('folder') as string;
    const images = formData.getAll('images') as File[];

    if (!folder || !images.length) {
      return NextResponse.json({ error: 'Missing folder or images' }, { status: 400 });
    }

    // Create folder if it doesn't exist
    const folderPath = join(process.cwd(), 'public', 'dogs', folder);
    await mkdir(folderPath, { recursive: true });

    // Save each image
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate filename: image1.jpg, image2.jpg, etc.
      const filename = `image${i + 1}.jpg`;
      const filePath = join(folderPath, filename);

      await writeFile(filePath, buffer);
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${images.length} image(s) to ${folder} folder`
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}