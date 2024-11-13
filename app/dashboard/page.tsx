'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore';
import { Calendar, Clock, Activity, AlertCircle, PawPrint } from 'lucide-react';
import { DashboardEvent, Appointment } from '@/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { parseISO, format, isAfter, startOfDay } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPets: 0,
    upcomingAppointments: 0,
    dueMedications: 0,
    healthAlerts: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<Appointment[]>([]);
  const [recentActivities, setRecentActivities] = useState<DashboardEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = 'current-user-id'; // Replace with actual auth
    const today = startOfDay(new Date());

    // Set up queries
    const setupQueries = async () => {
      try {
        // Simple queries without complex conditions
        const petsQuery = query(
          collection(db, 'pets'),
          where('userId', '==', userId)
        );

        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('userId', '==', userId),
          where('status', '==', 'scheduled'),
          orderBy('date', 'asc'),
          limit(5)
        );

        const medicationsQuery = query(
          collection(db, 'medications'),
          where('userId', '==', userId)
        );

        // Setup real-time listeners
        const unsubPets = onSnapshot(petsQuery, (snapshot) => {
          setStats(prev => ({ ...prev, totalPets: snapshot.size }));
        });

        const unsubAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
          const appointmentsData: Appointment[] = [];
          let upcomingCount = 0;

          snapshot.forEach((doc) => {
            const appointment = { id: doc.id, ...doc.data() } as Appointment;
            if (isAfter(parseISO(appointment.date), today)) {
              upcomingCount++;
              appointmentsData.push(appointment);
            }
          });

          setUpcomingEvents(appointmentsData);
          setStats(prev => ({ ...prev, upcomingAppointments: upcomingCount }));
        });

        const unsubMedications = onSnapshot(medicationsQuery, (snapshot) => {
          const medications: DashboardEvent[] = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              type: 'medication',
              title: data.name,
              date: data.nextDueDate,
              petName: data.petName,
              petId: data.petId,
              createdAt: data.createdAt
            };
          })
          .slice(0, 5);

          setRecentActivities(medications);
          setStats(prev => ({ 
            ...prev, 
            dueMedications: snapshot.size,
            healthAlerts: snapshot.size // Simplified alert logic
          }));
        });

        setIsLoading(false);

        // Cleanup listeners
        return () => {
          unsubPets();
          unsubAppointments();
          unsubMedications();
        };
      } catch (error) {
        console.error('Error setting up dashboard listeners:', error);
        setIsLoading(false);
      }
    };

    setupQueries();
  }, []);

  const formatDateTime = (date: string, time?: string) => {
    if (!date) return '';
    const formattedDate = format(parseISO(date), 'MMM d, yyyy');
    if (time) {
      return `${formattedDate} at ${format(parseISO(`2000-01-01T${time}`), 'h:mm a')}`;
    }
    return formattedDate;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
            <PawPrint className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Medications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.dueMedications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.healthAlerts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming appointments</p>
              ) : (
                upcomingEvents.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => router.push(`/pets/${appointment.petId}`)}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1)} - {appointment.petName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(appointment.date, appointment.time)}
                      </p>
                      {appointment.clinic && (
                        <p className="text-sm text-muted-foreground">
                          at {appointment.clinic}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/pets/${appointment.petId}/appointments`);
                      }}
                    >
                      View All
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medication Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No medication reminders</p>
              ) : (
                recentActivities.map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => router.push(`/pets/${event.petId}/medications`)}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {event.title} - {event.petName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDateTime(event.date)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}