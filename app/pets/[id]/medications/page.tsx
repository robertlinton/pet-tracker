// app/pets/[id]/medications/page.tsx

import { Suspense } from 'react';
import { MedicationsClient } from './medications-client';
import { Loading } from '@/components/ui/loading';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';

interface MedicationsPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getPetName(petId: string) {
  const petDoc = await getDoc(doc(db, 'pets', petId));
  if (!petDoc.exists()) {
    return notFound();
  }
  return petDoc.data().name;
}

export default async function MedicationsPage({ params }: MedicationsPageProps) {
  const resolvedParams = await params;
  const petName = await getPetName(resolvedParams.id);

  return (
    <Suspense fallback={<Loading />}>
      <MedicationsClient 
        petId={resolvedParams.id}
        petName={petName}
      />
    </Suspense>
  );
}