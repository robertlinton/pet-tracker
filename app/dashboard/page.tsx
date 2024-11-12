// app/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from '../../lib/firebase';
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
import { DashboardEvent } from '../../types';
import React from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPets: 0,
    upcomingAppointments: 0,
    dueMedications: 0,
    healthAlerts: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState<DashboardEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<DashboardEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userId = 'current-user-id'; // Replace with actual auth

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
          where('userId', '==', userId)
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
          const appointments: DashboardEvent[] = snapshot.docs
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                type: 'appointment',
                title: `${data.type} Appointment`,
                date: data.date,
                petName: data.petName,
                createdAt: data.createdAt
              };
            })
            .slice(0, 5); // Limit to 5 items client-side for now

          setUpcomingEvents(appointments);
          setStats(prev => ({ ...prev, upcomingAppointments: snapshot.size }));
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
                createdAt: data.createdAt
              };
            })
            .slice(0, 5); // Limit to 5 items client-side for now

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
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium">
                        {event.title} - {event.petName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              ) : (
                recentActivities.map((event) => (
                  <div key={event.id} className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium">
                        {event.title} - {event.petName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString()}
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