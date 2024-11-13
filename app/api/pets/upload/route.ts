// app/api/pets/upload/route.ts

import { put, del } from '@vercel/blob'; // Added 'del' for potential image deletion
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename is required' },
      { status: 400 }
    );
  }

  if (!request.body) {
    return NextResponse.json(
      { error: 'File content is required' },
      { status: 400 }
    );
  }

  try {
    // Convert the request to a blob
    const blob = await request.blob();
    
    // Create a unique filename with timestamp and sanitize it
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${Date.now()}-${sanitizedFilename}`;
    
    // Upload to Vercel Blob
    const uploadResult = await put(uniqueFilename, blob, {
      access: 'public',
      addRandomSuffix: true // Add random suffix to prevent filename collisions
    });

    // Assuming uploadResult contains a 'url' property
    return NextResponse.json({ url: uploadResult.url });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Optional: Implement DELETE if needed
export async function DELETE(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename is required for deletion' },
      { status: 400 }
    );
  }

  try {
    await del(filename);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
