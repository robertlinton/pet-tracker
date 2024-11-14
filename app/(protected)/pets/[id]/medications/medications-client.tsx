// app/(protected)/pets/[id]/medications/medications-client.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/context/auth-context';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { format, isAfter, parseISO } from 'date-fns';
import { Plus, Pill } from 'lucide-react';
import { MedicalRecord } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddMedicationDialog } from '@/components/AddMedicationDialog';
import { MedicationCard } from '@/components/MedicationCard';
import { useToast } from '@/hooks/use-toast';
import { Loading } from '@/components/ui/loading';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MedicationsClientProps {
  petId: string;
}

export function MedicationsClient({ petId }: MedicationsClientProps) {
  const [medications, setMedications] = useState<MedicalRecord[]>([]);
  const [petName, setPetName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !petId) return;

    // First verify pet ownership and get pet name
    const verifyPetOwnership = async () => {
      try {
        const petDoc = await getDoc(doc(db, 'pets', petId));
        if (!petDoc.exists() || petDoc.data()?.userId !== user.uid) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Pet not found or access denied.",
          });
          router.push('/dashboard');
          return false;
        }
        setPetName(petDoc.data().name);
        return true;
      } catch (error) {
        console.error('Error verifying pet ownership:', error);
        return false;
      }
    };

    const setupMedications = async () => {
      const hasAccess = await verifyPetOwnership();
      if (!hasAccess) return;

      const medicationsQuery = query(
        collection(db, 'medications'),
        where('petId', '==', petId),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(
        medicationsQuery,
        (snapshot) => {
          const medicationsData: MedicalRecord[] = [];
          snapshot.forEach((doc) => {
            medicationsData.push({ 
              id: doc.id,
              ...doc.data(),
              // Convert Firestore Timestamps to strings
              createdAt: doc.data().createdAt instanceof Timestamp 
                ? doc.data().createdAt.toDate().toISOString()
                : doc.data().createdAt,
              updatedAt: doc.data().updatedAt instanceof Timestamp 
                ? doc.data().updatedAt.toDate().toISOString()
                : doc.data().updatedAt,
            } as MedicalRecord);
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
    };

    setupMedications();
  }, [petId, user, toast, router]);

  const activeMedications = medications.filter(
    med => med.status === 'active' && (!med.nextDueDate || isAfter(parseISO(med.nextDueDate), new Date()))
  );

  const pastMedications = medications.filter(
    med => med.status !== 'active' || (med.nextDueDate && !isAfter(parseISO(med.nextDueDate), new Date()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size={32} />
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

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeMedications.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastMedications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-4">
              {activeMedications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Pill className="h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No active medications</p>
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
                activeMedications.map((medication) => (
                  <MedicationCard 
                    key={medication.id}
                    medication={medication}
                    isActive={true}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="past">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="space-y-4">
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
                    isActive={false}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}