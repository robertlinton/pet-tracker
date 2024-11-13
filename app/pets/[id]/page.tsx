// app/pets/[id]/page.tsx

import { Suspense } from 'react';
import { PetOverviewClient } from './pet-overview-client';
import { Loading } from '@/components/ui/loading';

interface PetOverviewPageProps {
  params: { id: string }; // Remove Promise here to fix the type issue
}

export default function PetOverviewPage({ params }: PetOverviewPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <PetOverviewClient petId={params.id} />
    </Suspense>
  );
}
