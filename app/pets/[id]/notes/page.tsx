// app/pets/[id]/notes/page.tsx

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { NotesList } from '@/components/NotesList';
import { AddNoteDialog } from '@/components/AddNoteDialog';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';

export default function NotesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const petId = pathname.split('/')[2]; // Extract petId from URL

  if (!petId) {
    return <div className="text-red-500">Invalid pet ID.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Notes</h1>
        <AddNoteDialog petId={petId}>
          <Button>
            Add Note
          </Button>
        </AddNoteDialog>
      </div>

      <NotesList petId={petId} />
    </div>
  );
}
