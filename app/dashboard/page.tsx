// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Appointment, DashboardEvent } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseISO, format, isAfter, startOfDay } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentFormSchema, AppointmentFormValues } from '@/lib/schemas/appointment';
import { Loading } from '@/components/ui/loading';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { capitalizeFirst } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { AddAppointmentDialog } from '@/components/AddAppointmentDialog';

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
  const { toast } = useToast();

  useEffect(() => {
    const userId = 'current-user-id'; // Replace with actual auth
    const now = new Date();

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
          orderBy('time', 'asc'),
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
            const appointmentDateTime = parseISO(`${appointment.date}T${appointment.time}`);

            if (isAfter(appointmentDateTime, now)) {
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
                type: data.type,
                title: data.name,
                date: data.nextDueDate || data.date, // Assuming nextDueDate is for upcoming
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
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
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
                        {capitalizeFirst(appointment.type)} - {appointment.petName}
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
                    <AddAppointmentDialog petId={appointment.petId}>
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
                    </AddAppointmentDialog>
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
