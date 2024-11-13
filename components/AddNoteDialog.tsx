// components/AddNoteDialog.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNotes } from '@/hooks/useNotes';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';

interface AddNoteDialogProps {
  petId: string;
  children: React.ReactNode;
}

const addNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(['behavior', 'health', 'general', 'emergency']).optional(),
});

type AddNoteForm = z.infer<typeof addNoteSchema>;

export function AddNoteDialog({ petId, children }: AddNoteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { addNote, isAdding } = useNotes(petId);
  const { toast } = useToast();
  const [user, loadingUser, errorUser] = useAuthState(auth);

  const form = useForm<AddNoteForm>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: {
      title: '',
      content: '',
      category: undefined,
    },
  });

  const onSubmit = async (data: AddNoteForm) => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to add notes.',
      });
      return;
    }

    try {
      await addNote({
        petId: petId,
        userId: user.uid, // Dynamically obtained from authenticated user
        title: data.title,
        content: data.content,
        category: data.category,
      });
      toast({
        title: 'Success',
        description: 'Note has been added successfully.',
      });
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add the note.',
      });
    }
  };

  if (loadingUser) {
    return <Loading />;
  }

  if (!user) {
    return <div>Please log in to add notes.</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Note</DialogTitle>
          <DialogDescription>
            Provide details about your pet's behavior, health, or any other relevant information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter note title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter note content"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="behavior">Behavior</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a category for your note (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isAdding}>
                {isAdding ? (
                  <>
                    <Loading size={16} className="mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Note'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
