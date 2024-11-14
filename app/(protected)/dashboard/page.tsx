'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, isAfter, parseISO, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  Clock,
  Activity,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  PawPrint,
  Pill,
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { AddPetDialog } from '@/components/AddPetDialog';
import { Badge } from "@/components/ui/badge";
import { capitalizeFirst, capitalizeWords } from '@/lib/utils';

interface DashboardStats {
  totalPets: number;
  upcomingAppointments: number;
  dueMedications: number;
  healthAlerts: number;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  imageUrl?: string;
  userId: string;
  createdAt: Timestamp;
}

interface Appointment {
  id: string;
  petId: string;
  petName: string;
  type: string;
  date: string;
  time: string;
  status: string;
  userId: string;
}

interface Medication {
  id: string;
  petId: string;
  petName: string;
  name: string;
  type: 'medication' | 'vaccination' | 'procedure';
  date: string;
  nextDueDate?: string;
  prescribedBy?: string;
  status: 'active' | 'completed' | 'discontinued';
  userId: string;
}

interface DashboardData {
  recentPets: Pet[];
  recentAppointments: Appointment[];
  recentMedications: Medication[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPets: 0,
    upcomingAppointments: 0,
    dueMedications: 0,
    healthAlerts: 0,
  });
  const [data, setData] = useState<DashboardData>({
    recentPets: [],
    recentAppointments: [],
    recentMedications: [],
  });
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const today = startOfDay(new Date());

    const petsQuery = query(
      collection(db, 'pets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('userId', '==', user.uid),
      where('status', '==', 'scheduled'),
      orderBy('date', 'asc'),
      limit(5)
    );

    const medicationsQuery = query(
      collection(db, 'medications'),
      where('userId', '==', user.uid),
      where('status', '==', 'active'),
      orderBy('nextDueDate', 'asc'),
      limit(5)
    );

    const unsubPets = onSnapshot(petsQuery, (snapshot) => {
      const pets: Pet[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Pet));
      setStats(prev => ({ ...prev, totalPets: snapshot.size }));
      setData(prev => ({ ...prev, recentPets: pets }));
    });

    const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const appointments: Appointment[] = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Appointment))
        .filter(apt => isAfter(parseISO(apt.date), today));

      setStats(prev => ({ ...prev, upcomingAppointments: appointments.length }));
      setData(prev => ({ ...prev, recentAppointments: appointments }));
    });

    const unsubMedications = onSnapshot(medicationsQuery, (snapshot) => {
      const medications: Medication[] = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Medication))
        .filter(med => med.nextDueDate && isAfter(parseISO(med.nextDueDate), today));

      setStats(prev => ({ 
        ...prev, 
        dueMedications: medications.length,
        healthAlerts: medications.length + (data.recentAppointments?.length || 0)
      }));
      setData(prev => ({ ...prev, recentMedications: medications }));
      setIsLoading(false);
    });

    return () => {
      unsubPets();
      unsubAppointments();
      unsubMedications();
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-2rem)]">
        <Loading size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome, {user?.displayName || 'User'}</h1>
        <AddPetDialog key="add-pet-dialog">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Pet
          </Button>
        </AddPetDialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <PawPrint className="h-8 w-8 mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalPets}</p>
            <p className="text-sm text-muted-foreground">Total Pets</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Calendar className="h-8 w-8 mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.upcomingAppointments}</p>
            <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Pill className="h-8 w-8 mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.dueMedications}</p>
            <p className="text-sm text-muted-foreground">Due Medications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Activity className="h-8 w-8 mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.healthAlerts}</p>
            <p className="text-sm text-muted-foreground">Health Alerts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pets">Recent Pets</TabsTrigger>
          <TabsTrigger value="appointments">Upcoming Appointments</TabsTrigger>
          <TabsTrigger value="medications">Due Medications</TabsTrigger>
        </TabsList>
        <TabsContent value="pets">
          {data.recentPets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <PawPrint className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg text-center mb-4">No pets added yet. Add your first pet to get started!</p>
                <AddPetDialog key="empty-state-add-pet">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Your First Pet
                  </Button>
                </AddPetDialog>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.recentPets.map((pet) => (
                  <Card 
                    key={pet.id} 
                    className="cursor-pointer hover:bg-accent transition-colors" 
                    onClick={() => router.push(`/pets/${pet.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 space-y-1">
                          <h3 className="text-lg font-semibold">{pet.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {capitalizeFirst(pet.species)} • {pet.breed ? capitalizeFirst(pet.breed) : 'No breed specified'}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
        <TabsContent value="appointments">
          <Card>
            <CardContent className="p-6">
              {data.recentAppointments.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg">No upcoming appointments</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-4">
                    {data.recentAppointments.map((apt) => (
                      <div 
                        key={apt.id} 
                        className="flex justify-between items-center p-4 bg-accent rounded-lg cursor-pointer hover:bg-accent/70"
                        onClick={() => router.push(`/pets/${apt.petId}/appointments`)}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge>{capitalizeWords(apt.type)}</Badge>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{apt.petName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(apt.date), 'PPP')} at {format(parseISO(`2000-01-01T${apt.time}`), 'h:mm a')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="medications">
          <Card>
            <CardContent className="p-6">
              {data.recentMedications.length === 0 ? (
                <div className="text-center py-4">
                  <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg">No medications due</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-24rem)]">
                  <div className="space-y-4">
                    {data.recentMedications.map((med) => (
                      <div 
                        key={med.id} 
                        className="flex justify-between items-center p-4 bg-accent rounded-lg cursor-pointer hover:bg-accent/70"
                        onClick={() => router.push(`/pets/${med.petId}/medications`)}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={med.type === 'medication' ? 'default' : med.type === 'vaccination' ? 'secondary' : 'outline'}>
                              {capitalizeFirst(med.type)}
                            </Badge>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{med.petName}</span>
                          </div>
                          <p className="font-medium">{med.name}</p>
                          {med.nextDueDate && (
                            <p className="text-sm text-muted-foreground">
                              Due: {format(parseISO(med.nextDueDate), 'PPP')}
                            </p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}