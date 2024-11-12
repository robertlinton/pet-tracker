// components/EditPetDialog.tsx\

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Pet } from '@/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
} from "@/components/ui/alert-dialog"
import { useToast } from "../hooks/use-toast";
import { Loading } from "@/components/ui/loading";

const editPetSchema = z.object({
  name: z.string().min(1, "Pet name is required").max(50),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

type FormData = z.infer<typeof editPetSchema>;

interface EditPetDialogProps {
  pet: Pet;
  children?: React.ReactNode;
}

export function EditPetDialog({ pet, children }: EditPetDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(editPetSchema),
    defaultValues: {
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      birthDate: pet.birthDate,
    },
  });

  const handleImageUpload = async (file: File): Promise<string> => {
    const imageRef = ref(storage, `pets/${Date.now()}-${file.name}`);
    const uploadResult = await uploadBytes(imageRef, file);
    return getDownloadURL(uploadResult.ref);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      // Handle image upload if a new image was selected
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const imageFile = fileInput?.files?.[0];
      
      let imageUrl = pet.imageUrl;
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      // Update pet document
      const petRef = doc(db, 'pets', pet.id);
      await updateDoc(petRef, {
        ...data,
        imageUrl,
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: "Success!",
        description: "Pet information updated successfully.",
      });

      setIsOpen(false);
      router.refresh();

    } catch (error) {
      console.error('Error updating pet:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem updating the pet information.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await deleteDoc(doc(db, 'pets', pet.id));
      
      toast({
        title: "Pet Deleted",
        description: "Pet has been successfully removed.",
      });

      setIsDeleteDialogOpen(false);
      setIsOpen(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting pet:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem deleting the pet.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Pet Information</DialogTitle>
            <DialogDescription>
              Update your pet's information here.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pet Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="species"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Species</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="fish">Fish</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional: Enter your pet's breed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="image">Pet Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                />
                <p className="text-sm text-muted-foreground">
                  Optional: Upload a new photo
                </p>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive">
                      Delete Pet
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        pet's profile and all associated records.
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
                            <Loading size={16} className="mr-2" />
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
                      <Loading size={16} className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}