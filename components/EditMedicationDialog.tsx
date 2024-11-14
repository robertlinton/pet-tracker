'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { medicationFormSchema, type MedicationFormValues } from '@/lib/schemas/medication';
import { MedicalRecord } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/lib/context/auth-context';

interface EditMedicationDialogProps {
  children: React.ReactNode;
  medication: MedicalRecord;
}

export function EditMedicationDialog({ children, medication }: EditMedicationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: medication.name || '',
      type: medication.type || 'medication',
      date: medication.date || '',
      nextDueDate: medication.nextDueDate || '',
      prescribedBy: medication.prescribedBy || '',
      dosage: medication.dosage || '',
      frequency: medication.frequency || '',
      duration: medication.duration || '',
      notes: medication.notes || '',
      status: medication.status || 'active',
    },
  });

  async function onSubmit(data: MedicationFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to update medications.",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Verify ownership
      const medicationRef = doc(db, 'medications', medication.id);
      const medicationDoc = await getDoc(medicationRef);
      
      if (!medicationDoc.exists() || medicationDoc.data()?.userId !== user.uid) {
        throw new Error('Unauthorized to update this medication');
      }

      await updateDoc(medicationRef, {
        ...data,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Success",
        description: "Medication has been updated successfully.",
      });

      setIsOpen(false);
      router.refresh();

    } catch (error) {
      console.error('Error updating medication:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem updating the medication. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to delete medications.",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Verify ownership before deletion
      const medicationRef = doc(db, 'medications', medication.id);
      const medicationDoc = await getDoc(medicationRef);
      
      if (!medicationDoc.exists() || medicationDoc.data()?.userId !== user.uid) {
        throw new Error('Unauthorized to delete this medication');
      }

      await deleteDoc(medicationRef);

      toast({
        title: "Success",
        description: "Medication has been deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem deleting the medication.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Medication</DialogTitle>
          <DialogDescription>
            Update medication details or mark as completed
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 pb-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextDueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prescribedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prescribed By</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

              </div>
            </ScrollArea>
            <DialogFooter className="gap-2 sm:gap-0">
              <div className="flex w-full justify-between">
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={isLoading}>
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this
                        medication record.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isLoading ? (
                          <>
                            <Loading className="mr-2" size={16} />
                            Deleting...
                          </>
                        ) : (
                          'Delete'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loading className="mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}