// app/pets/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { Pet, Appointment, MedicalRecord, WeightRecord } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Pill, Weight, Edit, Cake, PawPrint } from 'lucide-react';
import { EditPetDialog } from "@/components/EditPetDialog";
import { capitalizeFirst } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PetOverviewPage({ params }: PageProps) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentMedications, setRecentMedications] = useState<MedicalRecord[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [id, setId] = useState<string | null>(null);

  // Resolve params to get the pet ID
  useEffect(() => {
    params.then(resolvedParams => {
      setId(resolvedParams.id);
    }).catch(error => {
      console.error("Failed to resolve params:", error);
    });
  }, [params]);

  // Fetch pet data only when ID is available
  useEffect(() => {
    if (!id) return;

    const fetchPetData = async () => {
      try {
        const petDoc = await getDoc(doc(db, 'pets', id));
        if (petDoc.exists()) {
          setPet({ id: petDoc.id, ...petDoc.data() } as Pet);
        }

        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('petId', '==', id),
          limit(3)
        );

        const medicationsQuery = query(
          collection(db, 'medications'),
          where('petId', '==', id),
          limit(3)
        );

        const weightQuery = query(
          collection(db, 'weights'),
          where('petId', '==', id),
          limit(5)
        );

        const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
          const appointments: Appointment[] = [];
          snapshot.forEach((doc) => {
            appointments.push({ id: doc.id, ...doc.data() } as Appointment);
          });
          setUpcomingAppointments(appointments);
        });

        const unsubMedications = onSnapshot(medicationsQuery, (snapshot) => {
          const medications: MedicalRecord[] = [];
          snapshot.forEach((doc) => {
            medications.push({ id: doc.id, ...doc.data() } as MedicalRecord);
          });
          setRecentMedications(medications);
        });

        const unsubWeights = onSnapshot(weightQuery, (snapshot) => {
          const weights: WeightRecord[] = [];
          snapshot.forEach((doc) => {
            weights.push({ id: doc.id, ...doc.data() } as WeightRecord);
          });
          setWeightHistory(weights);
        });

        setIsLoading(false);

        return () => {
          unsubAppointments();
          unsubMedications();
          unsubWeights();
        };

      } catch (error) {
        console.error('Error fetching pet data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load pet information. Please try again.",
        });
        setIsLoading(false);
      }
    };

    fetchPetData();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Pet not found</p>
      </div>
    );
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    if (months < 0) {
      years -= 1;
      months += 12;
    }
    if (now.getDate() < birth.getDate()) {
      months -= 1;
    }

    if (years === 0 && months === 0) {
      return { text: "Less than a month old", tooltip: "Born recently" };
    }
    if (years === 0) {
      return { text: `${months} month${months > 1 ? 's' : ''} old`, tooltip: `${months} months since birth` };
    }
    if (months === 0) {
      return { text: `${years} year${years > 1 ? 's' : ''} old`, tooltip: `${years} years since birth` };
    }
    return { text: `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''} old`, tooltip: `${years} years and ${months} months since birth` };
  };

  const ageInfo = calculateAge(pet.birthDate);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-24 w-24">
            {pet.imageUrl ? (
              <AvatarImage src={pet.imageUrl} alt={pet.name} />
            ) : (
              <AvatarFallback>
                <PawPrint className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{pet.name}</h1>
            <p className="text-muted-foreground">
              {pet.breed ? `${capitalizeFirst(pet.species)} • ${pet.breed}` : capitalizeFirst(pet.species)}
            </p>
          </div>
        </div>
        <EditPetDialog pet={pet}>
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Pet
          </Button>
        </EditPetDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Age</CardTitle>
            <Cake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-2xl font-bold cursor-pointer">{ageInfo.text}</div>
              </TooltipTrigger>
              <TooltipContent>{ageInfo.tooltip}</TooltipContent>
            </Tooltip>
            <p className="text-xs text-muted-foreground">Born {new Date(pet.birthDate).toLocaleDateString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentMedications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Weight</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weightHistory[0] ? `${weightHistory[0].weight} ${weightHistory[0].unit}` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="weight">Weight History</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{appointment.type}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                        </p>
                      </div>
                      {appointment.clinic && (
                        <p className="text-sm text-muted-foreground">{appointment.clinic}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <div className="grid gap-4">
            {recentMedications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Pill className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No medications</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              recentMedications.map((medication) => (
                <Card key={medication.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{medication.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(medication.date).toLocaleDateString()}
                        </p>
                      </div>
                      {medication.prescribedBy && (
                        <p className="text-sm text-muted-foreground">
                          Prescribed by: {medication.prescribedBy}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="weight" className="space-y-4">
          <div className="grid gap-4">
            {weightHistory.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2">
                    <Weight className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No weight records</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              weightHistory.map((weight) => (
                <Card key={weight.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{weight.weight} {weight.unit}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(weight.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
