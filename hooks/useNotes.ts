// hooks/useNotes.ts

'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export function useNotes(petId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'notes'),
      where('petId', '==', petId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notesData: Note[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          notesData.push({
            id: docSnap.id,
            petId: data.petId,
            title: data.title,
            content: data.content,
            category: data.category,
            userId: data.userId,
            createdAt: data.createdAt
              ? data.createdAt.toDate().toISOString()
              : '',
            updatedAt: data.updatedAt
              ? data.updatedAt.toDate().toISOString()
              : '',
          });
        });
        setNotes(notesData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching notes:', err);
        setError('Failed to load notes.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [petId]);

  const addNote = async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsAdding(true);
    try {
      await addDoc(collection(db, 'notes'), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    } finally {
      setIsAdding(false);
    }
  };

  const updateNote = async (id: string, data: Partial<Note>) => {
    setIsUpdating(true);
    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteNote = async (id: string) => {
    setIsDeleting(true);
    try {
      const noteRef = doc(db, 'notes', id);
      await deleteDoc(noteRef);
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    notes,
    isLoading,
    isAdding,
    isUpdating,
    isDeleting,
    error,
    addNote,
    updateNote,
    deleteNote,
  };
}
