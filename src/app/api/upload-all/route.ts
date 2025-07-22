import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];

    if (!images.length) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // Get all puppy folders from the database or predefined list
    const puppyFolders = [
      'dam', 'sire', 'gray', 'blue', 'fuchsia', 'green', 'pink', 'red', 'sky', 'violet', 'yellow'
    ];

    const results = [];

    // Upload to each folder
    for (const folder of puppyFolders) {
      try {
        // Create folder if it doesn't exist
        const folderPath = join(process.cwd(), 'public', 'dogs', folder);
        await mkdir(folderPath, { recursive: true });

        // Save each image to this folder
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const bytes = await image.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate filename: image1.jpg, image2.jpg, etc.
          const filename = `image${i + 1}.jpg`;
          const filePath = join(folderPath, filename);

          await writeFile(filePath, buffer);
        }

        results.push({ folder, success: true, count: images.length });
      } catch (error) {
        console.error(`Error uploading to ${folder}:`, error);
        results.push({ folder, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    const successfulUploads = results.filter(r => r.success);
    const failedUploads = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      message: `Uploaded ${images.length} image(s) to ${successfulUploads.length} folders`,
      results,
      summary: {
        totalFolders: puppyFolders.length,
        successful: successfulUploads.length,
        failed: failedUploads.length
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: 'Bulk upload failed' }, { status: 500 });
  }
}