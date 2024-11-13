// app/api/notes/[id]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import {
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { Note } from '@/types';
import { z } from 'zod';

// Define the schema for updating a note
const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  content: z.string().min(1, 'Content is required').optional(),
  category: z.enum(['behavior', 'health', 'general', 'emergency']).optional(),
});

// PUT Handler: Update an existing note
export async function PUT(
  request: NextRequest,
  { params, searchParams }: { params: { id: string }; searchParams: URLSearchParams }
) {
  const { id } = params;

  try {
    const body = await request.json();

    // Validate the request body
    const parsed = updateNoteSchema.parse(body);

    const noteRef = doc(db, 'notes', id);

    // Check if the note exists
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Update the note with new data and update the 'updatedAt' timestamp
    await updateDoc(noteRef, {
      ...parsed,
      updatedAt: serverTimestamp(),
    });

    // Fetch the updated note
    const updatedNoteSnap = await getDoc(noteRef);
    const updatedData = updatedNoteSnap.data();

    const updatedNote: Note = {
      id: updatedNoteSnap.id,
      petId: updatedData?.petId,
      title: updatedData?.title,
      content: updatedData?.content,
      category: updatedData?.category,
      userId: updatedData?.userId,
      createdAt: updatedData?.createdAt
        ? updatedData.createdAt.toDate().toISOString()
        : '',
      updatedAt: updatedData?.updatedAt
        ? updatedData.updatedAt.toDate().toISOString()
        : '',
    };

    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error: any) {
    console.error('Error updating note:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE Handler: Delete an existing note
export async function DELETE(
  request: NextRequest,
  { params, searchParams }: { params: { id: string }; searchParams: URLSearchParams }
) {
  const { id } = params;

  try {
    const noteRef = doc(db, 'notes', id);

    // Check if the note exists
    const noteSnap = await getDoc(noteRef);
    if (!noteSnap.exists()) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Delete the note
    await deleteDoc(noteRef);

    return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
