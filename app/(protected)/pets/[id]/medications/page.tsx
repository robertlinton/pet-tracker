import React from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface MedicationsPageProps {
  params: {
    id: string;
  };
}

const MedicationsPage: React.FC<MedicationsPageProps> = ({ params }) => {
  const { id } = params;
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Medications for Pet ID: {id}</h1>
    </div>
  );
};

export default MedicationsPage;
