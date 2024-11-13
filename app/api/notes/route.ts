// app/api/notes/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Note } from '@/types';
import { z } from 'zod';

const noteSchema = z.object({
  petId: z.string().min(1, 'petId is required'),
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(['behavior', 'health', 'general', 'emergency']).optional(),
  userId: z.string().min(1, 'userId is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body
    const parsed = noteSchema.parse(body);

    const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
      petId: parsed.petId,
      title: parsed.title,
      content: parsed.content,
      category: parsed.category,
      userId: parsed.userId,
    };

    const docRef = await addDoc(collection(db, 'notes'), {
      ...newNote,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const note: Note = {
      id: docRef.id,
      ...newNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    console.error('Error creating note:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
