import { put } from '@vercel/blob';
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

    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}