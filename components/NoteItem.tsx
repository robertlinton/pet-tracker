// components/NoteItem.tsx

'use client';

import { Note } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { EditNoteDialog } from './EditNoteDialog';
import { useNotes } from '@/hooks/useNotes';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';

interface NoteItemProps {
  note: Note;
}

export function NoteItem({ note }: NoteItemProps) {
  const { deleteNote, isDeleting } = useNotes(note.petId);
  const { toast } = useToast();

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;

    try {
      await deleteNote(note.id);
      toast({
        title: 'Deleted',
        description: 'Note has been deleted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the note.',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex justify-between items-start">
        <div>
          <CardTitle>{note.title}</CardTitle>
          {note.category && (
            <Badge variant="outline" className="mt-1">
              {note.category}
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <EditNoteDialog note={note}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </EditNoteDialog>
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loading size={16} /> : <Trash className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{note.content}</CardDescription>
        <div className="mt-2 text-xs text-muted-foreground">
          Last updated: {new Date(note.updatedAt as string).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
