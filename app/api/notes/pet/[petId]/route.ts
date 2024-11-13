// app/api/notes/pet/[petId]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Note } from '@/types';

export async function GET(request: Request, { params }: { params: { petId: string } }) {
  const { petId } = params;

  try {
    const q = query(
      collection(db, 'notes'),
      where('petId', '==', petId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const notes: Note[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notes.push({
        id: doc.id,
        petId: data.petId,
        title: data.title,
        content: data.content,
        category: data.category,
        userId: data.userId,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : '',
        updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : '',
      });
    });

    return NextResponse.json(notes, { status: 200 });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
