'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, limit, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pet, Appointment, MedicalRecord, WeightRecord } from '@/types';
import { useAuth } from '@/lib/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Pill, Weight, Edit, Cake, PawPrint, Clock, AlertCircle } from 'lucide-react';
import { EditPetDialog } from "@/components/EditPetDialog";
import { AddMedicationDialog } from "@/components/AddMedicationDialog";
import { capitalizeFirst, capitalizeWords } from '@/lib/utils';
import { parseISO, format, formatDistanceToNow, isAfter, startOfDay } from 'date-fns';
import { useRouter } from 'next/navigation';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';

interface PetOverviewClientProps {
  petId: string;
}

export function PetOverviewClient({ petId }: PetOverviewClientProps) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentMedications, setRecentMedications] = useState<MedicalRecord[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const today = startOfDay(new Date());

  useEffect(() => {
    if (!petId || !user) return;

    const fetchPetData = async () => {
      try {
        const petDoc = await getDoc(doc(db, 'pets', petId));

        // Verify pet ownership
        if (!petDoc.exists() || petDoc.data()?.userId !== user.uid) {
          router.push('/dashboard');
          toast({
            variant: "destructive",
            title: "Error",
            description: "Pet not found or access denied.",
          });
          return;
        }

        setPet({ id: petDoc.id, ...petDoc.data() } as Pet);

        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('petId', '==', petId),
          where('userId', '==', user.uid),
          where('status', '==', 'scheduled'),
          limit(3)
        );

        const medicationsQuery = query(
          collection(db, 'medications'),
          where('petId', '==', petId),
          where('userId', '==', user.uid),
          where('status', '==', 'active'),
          orderBy('nextDueDate', 'asc'),
          limit(3)
        );

        const weightQuery = query(
          collection(db, 'weights'),
          where('petId', '==', petId),
          where('userId', '==', user.uid),
          limit(5)
        );

        // Set up real-time listeners
        const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
          const appointments: Appointment[] = [];
          snapshot.forEach((doc) => {
            const appointment = { id: doc.id, ...doc.data() } as Appointment;
            if (isAfter(parseISO(appointment.date), today)) {
              appointments.push(appointment);
            }
          });
          setUpcomingAppointments(appointments);
        });

        const unsubMedications = onSnapshot(medicationsQuery, (snapshot) => {
          const medications: MedicalRecord[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            medications.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp 
                ? data.createdAt.toDate().toISOString()
                : data.createdAt,
              updatedAt: data.updatedAt instanceof Timestamp 
                ? data.updatedAt.toDate().toISOString()
                : data.updatedAt,
            } as MedicalRecord);
          });
          setRecentMedications(medications.filter(med => 
            med.nextDueDate && isAfter(parseISO(med.nextDueDate), today)
          ));
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
  }, [petId, user, toast, router, today]);

  const formatDate = (dateString: string): string => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const formatDateTime = (date: string, time?: string) => {
    if (!date) return '';
    const formattedDate = format(parseISO(date), 'MMM d, yyyy');
    if (time) {
      return `${formattedDate} at ${format(parseISO(`2000-01-01T${time}`), 'h:mm a')}`;
    }
    return formattedDate;
  };

  const calculateAge = (birthDate: string) => {
    const birth = parseISO(birthDate);
    const now = new Date();
    const age = formatDistanceToNow(birth);
    return { text: age, tooltip: `Born on ${formatDate(birthDate)}` };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
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
                <div className="text-2xl font-bold cursor-help">{ageInfo.text}</div>
              </TooltipTrigger>
              <TooltipContent>{ageInfo.tooltip}</TooltipContent>
            </Tooltip>
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
            <p className="text-xs text-muted-foreground">
              {recentMedications.length === 1 ? 'medication' : 'medications'} due
            </p>
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
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
            <AddAppointmentDialog petId={petId}>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </AddAppointmentDialog>
          </div>
          <div className="grid gap-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No upcoming appointments</p>
                  <p className="text-sm text-muted-foreground mb-4">Schedule a new appointment</p>
                  <AddAppointmentDialog petId={petId}>
                    <Button>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </Button>
                  </AddAppointmentDialog>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} className="cursor-pointer hover:bg-accent/50" onClick={() => router.push(`/pets/${petId}/appointments`)}>
                  <CardContent className="flex justify-between items-center p-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge>{capitalizeFirst(appointment.type)}</Badge>
                        {appointment.status === 'scheduled' && (
                          <Badge variant="outline">Scheduled</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(appointment.date, appointment.time)}
                      </p>
                      {appointment.clinic && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {appointment.clinic}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
            {upcomingAppointments.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/pets/${petId}/appointments`)}
              >
                View All Appointments
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Current Medications</h2>
            <AddMedicationDialog petId={pet.id} petName={pet.name}>
              <Button>
                <Pill className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </AddMedicationDialog>
          </div>
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <div className="grid gap-4">
              {recentMedications.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Pill className="h-8 w-8 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No active medications</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add medications or treatments for your pet
                    </p>
                    <AddMedicationDialog petId={pet.id} petName={pet.name}>
                      <Button>
                        <Pill className="mr-2 h-4 w-4" />
                        Add Medication
                      </Button>
                    </AddMedicationDialog>
                  </CardContent>
                </Card>
              ) : (
                recentMedications.map((medication) => (
                  <Card key={medication.id} className="cursor-pointer hover:bg-accent/50">
                    <CardContent className="flex justify-between items-center p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={medication.type === 'medication' ? 'default' : 
                            medication.type === 'vaccination' ? 'secondary' : 'outline'}>
                            {capitalizeFirst(medication.type)}
                          </Badge>
                          {medication.status && (
                            <Badge variant="outline">
                              {capitalizeFirst(medication.status)}
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{medication.name}</p>
                        {medication.nextDueDate && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Due: {format(parseISO(medication.nextDueDate), 'PPP')}
                          </p>
                        )}
                        {medication.prescribedBy && (
                          <p className="text-sm text-muted-foreground">
                            Prescribed by: {medication.prescribedBy}
                          </p>
                        )}
                        {medication.notes && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-help">
                                <AlertCircle className="h-4 w-4" />
                                <span className="truncate max-w-[300px]">{medication.notes}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-[300px] whitespace-normal">{medication.notes}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/pets/${pet.id}/medications`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="weight" className="space-y-4">
          <div className="grid gap-4">
            {weightHistory.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Weight className="h-8 w-8 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No weight records</p>
                  <p className="text-sm text-muted-foreground">
                    No weight history recorded yet
                  </p>
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
                          {formatDate(weight.date)}
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
