// eslint-disable

// app/pets/[id]/page.tsx
import { Suspense } from 'react';
import { PetOverviewClient } from './pet-overview-client';
import { Loading } from '@/components/ui/loading';

interface PetOverviewPageProps {
  params: { id: string }; // Use a plain object without async Promise type
}

export default function PetOverviewPage({ params }: PetOverviewPageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <PetOverviewClient petId={params.id} />
    </Suspense>
  );
}
