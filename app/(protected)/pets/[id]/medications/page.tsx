// app/(protected)/pets/[id]/medications/page.tsx
import { Suspense } from 'react';
import { MedicationsClient } from './medications-client';
import { Loading } from '@/components/ui/loading';

interface MedicationsPageProps {
  params: {
    id: string;
  }
  searchParams: {
    [key: string]: string | string[] | undefined;
  }
}
export default function MedicationsPage({ params }: MedicationsPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <MedicationsClient petId={params.id} />
    </Suspense>
  );
}