// components/AddPetDialog.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { PlusCircle } from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { addPetSchema } from '@/lib/schemas/pet';

type FormData = z.infer<typeof addPetSchema>

export function AddPetDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(addPetSchema),
    defaultValues: {
      name: "",
      species: "",
      breed: "",
      birthDate: "",
      imageUrl: "",
    },
  });

  const handleImageUpload = async (file: File): Promise<string> => {
    const imageRef = ref(storage, `pets/${Date.now()}-${file.name}`);
    const uploadResult = await uploadBytes(imageRef, file);
    return getDownloadURL(uploadResult.ref);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsUploading(true);
      
      // Get the file input element and its files
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const imageFile = fileInput?.files?.[0];
      
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      // Add pet document to Firestore
      await addDoc(collection(db, 'pets'), {
        ...data,
        imageUrl,
        userId: 'current-user-id', // Replace with actual user ID from auth
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast({
        title: "Success!",
        description: "Your pet has been added successfully.",
      });

      setIsOpen(false);
      form.reset();
      router.refresh();

    } catch (error) {
      console.error('Error adding pet:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem adding your pet. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Pet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Pet</DialogTitle>
          <DialogDescription>
            Add your pet's information here. You can add more details later.
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
                    <Input placeholder="Enter pet's name" {...field} />
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
                    <Input placeholder="Enter breed (optional)" {...field} />
                  </FormControl>
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
              <FormLabel>Pet Image</FormLabel>
              <Input
                id="image"
                type="file"
                accept="image/*"
              />
              <FormDescription>
                Optional: Upload a photo of your pet
              </FormDescription>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loading size={16} className="mr-2" />
                    Adding Pet...
                  </>
                ) : (
                  'Add Pet'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}