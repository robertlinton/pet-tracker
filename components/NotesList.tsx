// components/NotesList.tsx

'use client';

import { Note } from '@/types';
import { useNotes } from '@/hooks/useNotes';
import { NoteItem } from './NoteItem';
import { Loading } from '@/components/ui/loading';

interface NotesListProps {
  petId: string;
}

export function NotesList({ petId }: NotesListProps) {
  const { notes, isLoading, error } = useNotes(petId);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-red-500">Error loading notes.</div>;
  }

  if (notes.length === 0) {
    return <div className="text-muted-foreground">No notes found for this pet.</div>;
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  );
}
