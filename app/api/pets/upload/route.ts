import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

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

  // Create a unique filename with timestamp
  const uniqueFilename = `${Date.now()}-${filename}`;
  
  try {
    // Convert the request to a blob first
    const blob = await request.blob();
    
    const uploadResult = await put(uniqueFilename, blob, {
      access: 'public',
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