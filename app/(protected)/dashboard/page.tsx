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
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, isAfter, parseISO, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Activity, 
  AlertCircle,
  PlusCircle,
  ArrowRight,
  PawPrint,
} from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { AddPetDialog } from '@/components/AddPetDialog';
import { capitalizeFirst, capitalizeWords } from '@/lib/utils'; // Import capitalization functions

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
  type: string;
  date: string;
  time: string;
  status: string;
  userId: string;
}

interface Medication {
  id: string;
  petId: string;
  name: string;
  nextDueDate: string;
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

    // Set up queries
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
      orderBy('nextDueDate', 'asc'),
      limit(5)
    );

    // Set up real-time listeners
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
      const medications: Medication[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Medication));

      setStats(prev => ({ 
        ...prev, 
        dueMedications: medications.length,
        healthAlerts: medications.filter(med => 
          isAfter(parseISO(med.nextDueDate), today)
        ).length
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
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Welcome, {user?.displayName || 'User'}
        </h1>
        <AddPetDialog key="add-pet-dialog" />
      </div>
      
      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPets}</div>
            <p className="text-xs text-muted-foreground">
              Active pet profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Medications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dueMedications}</div>
            <p className="text-xs text-muted-foreground">
              Active medications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Alerts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.healthAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Active alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent pets section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Recent Pets</h2>
          {data.recentPets.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <PawPrint className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  No pets added yet. Add your first pet to get started!
                </p>
                <AddPetDialog key="empty-state-add-pet">
                  <Button variant="outline" className="mt-4">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Your First Pet
                  </Button>
                </AddPetDialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.recentPets.map((pet) => (
                <Card
                  key={pet.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => router.push(`/pets/${pet.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium">{pet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {capitalizeFirst(pet.species)} •{' '}
                          {pet.breed ? capitalizeFirst(pet.breed) : 'No breed specified'}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent appointments and medications */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentAppointments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentAppointments.map((apt) => (
                  <div key={apt.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{capitalizeWords(apt.type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(apt.date), 'PPP')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/pets/${apt.petId}/appointments`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Due Medications */}
        <Card>
          <CardHeader>
            <CardTitle>Due Medications</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentMedications.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No medications due</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentMedications.map((med) => (
                  <div key={med.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(parseISO(med.nextDueDate), 'PPP')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/pets/${med.petId}/medications`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
