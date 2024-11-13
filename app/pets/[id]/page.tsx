// app/pets/[id]/page.tsx
import { Suspense } from 'react';
import { PetOverviewClient } from './pet-overview-client';
import { Loading } from '@/components/ui/loading';

interface Params {
  id: string;
}

export default async function PetOverviewPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Loading />}>
      <PetOverviewClient petId={params.id} />
    </Suspense>
  );
}