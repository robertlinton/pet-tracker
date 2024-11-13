// app/pets/[id]/appointments/page.tsx

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";

interface PageProps {
  params: { id: string };
}

export default function AppointmentsPage({ params }: PageProps) {
  const { id: petId } = params;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!petId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Pet ID is missing.",
      });
      setIsLoading(false);
      return;
    }

    const appointmentsRef = collection(db, 'appointments');
    const q = query(appointmentsRef, where('petId', '==', petId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedAppointments: Appointment[] = [];
      snapshot.forEach(doc => {
        fetchedAppointments.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setAppointments(fetchedAppointments);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching appointments:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load appointments.",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [petId, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>
      {appointments.length === 0 ? (
        <p>No appointments found for this pet.</p>
      ) : (
        appointments.map(appointment => (
          <Card key={appointment.id} className="mb-4">
            <CardHeader>
              <CardTitle>{appointment.type} with {appointment.vetName || 'Vet'}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Date: {appointment.date}</p>
              <p>Time: {appointment.time}</p>
              {appointment.notes && <p>Notes: {appointment.notes}</p>}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
