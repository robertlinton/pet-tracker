// app/api/pet-images/[...path]/route.ts
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the full path from the URL segments
    const fullPath = params.path.join('/');
    const fileRef = ref(storage, fullPath);
    const url = await getDownloadURL(fileRef);

    // Redirect to the actual image URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error fetching image:', error);
    return new NextResponse('Image not found', { status: 404 });
  }
}