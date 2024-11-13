// app/pets/[id]/appointments/page.tsx
import { Suspense } from 'react';
import { AppointmentsClient } from './appointments-client';
import { Loading } from '@/components/ui/loading';

interface AppointmentsPageProps {
  params: {
    id: string;
  };
}

export default function AppointmentsPage({ params }: AppointmentsPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <AppointmentsClient petId={params.id} />
    </Suspense>
  );
}