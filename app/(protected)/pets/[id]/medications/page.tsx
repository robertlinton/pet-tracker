import { Suspense } from 'react';
import { MedicationsClient } from './medications-client';
import { Loading } from '@/components/ui/loading';

interface PageProps {
  params: { id: string }
}

export default async function MedicationsPage({ params }: PageProps) {
  const id = params.id;

  return (
    <Suspense fallback={<Loading />}>
      <MedicationsClient petId={id} />
    </Suspense>
  );
}