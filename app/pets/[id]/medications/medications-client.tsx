'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
} from 'firebase/firestore';
import { format, isAfter, isBefore, parseISO } from 'date-fns';
import { Plus, Pill } from 'lucide-react';
import { MedicalRecord } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddMedicationDialog } from '@/components/AddMedicationDialog';
import { MedicationCard } from '@/components/MedicationCard';
import { useToast } from '@/hooks/use-toast';

interface MedicationsClientProps {
  petId: string;
  petName: string;
}

export function MedicationsClient({ petId, petName }: MedicationsClientProps) {
  const [medications, setMedications] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!petId) return;

    const medicationsQuery = query(
      collection(db, 'medications'),
      where('petId', '==', petId),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      medicationsQuery,
      (snapshot) => {
        const medicationsData: MedicalRecord[] = [];
        snapshot.forEach((doc) => {
          medicationsData.push({ id: doc.id, ...doc.data() } as MedicalRecord);
        });
        setMedications(medicationsData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching medications:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load medications. Please try again."
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [petId, toast]);

  const classifyMedication = (medication: MedicalRecord) => {
    const today = new Date();
    
    // If it's a one-time medication
    if ((medication as any).frequency === 'once') {
      return isBefore(parseISO(medication.date), today) ? 'past' : 'current';
    }

    // If it's a recurring medication with nextDueDate
    if (medication.nextDueDate) {
      return isAfter(parseISO(medication.nextDueDate), today) ? 'current' : 'past';
    }

    // For procedures or vaccinations without nextDueDate
    if (medication.type === 'procedure' || medication.type === 'vaccination') {
      return isBefore(parseISO(medication.date), today) ? 'past' : 'current';
    }

    // Default case - if it's dated in the past, consider it past
    return isBefore(parseISO(medication.date), today) ? 'past' : 'current';
  };

  const currentMedications = medications.filter(
    med => classifyMedication(med) === 'current'
  ).sort((a, b) => {
    // Sort by nextDueDate if available, otherwise by date
    const dateA = a.nextDueDate ? a.nextDueDate : a.date;
    const dateB = b.nextDueDate ? b.nextDueDate : b.date;
    return parseISO(dateA).getTime() - parseISO(dateB).getTime();
  });

  const pastMedications = medications.filter(
    med => classifyMedication(med) === 'past'
  ).sort((a, b) => {
    // Sort by date in descending order (most recent first)
    return parseISO(b.date).getTime() - parseISO(a.date).getTime();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medications</h1>
          <p className="text-muted-foreground">
            Manage your pet's medications and treatments
          </p>
        </div>
        <AddMedicationDialog petId={petId} petName={petName}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Medication
          </Button>
        </AddMedicationDialog>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">
            Current ({currentMedications.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastMedications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentMedications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Pill className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No current medications</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a new medication for your pet
                </p>
                <AddMedicationDialog petId={petId} petName={petName}>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Medication
                  </Button>
                </AddMedicationDialog>
              </CardContent>
            </Card>
          ) : (
            currentMedications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastMedications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Pill className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No past medications</p>
                <p className="text-sm text-muted-foreground">
                  Past and completed medications will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            pastMedications.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}