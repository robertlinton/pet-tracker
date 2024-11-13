// app/pets/[id]/page.tsx
import { Suspense } from 'react';
import { PetOverviewClient } from './pet-overview-client';
import { Loading } from '@/components/ui/loading';

interface PetOverviewPageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function PetOverviewPage({ params }: PetOverviewPageProps) {
  const resolvedParams = await params;
  return (
    <Suspense fallback={<Loading />}>
      <PetOverviewClient petId={resolvedParams.id} />
    </Suspense>
  );
}
