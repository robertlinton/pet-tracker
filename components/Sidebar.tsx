'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Pet } from '@/types';
import { 
  Home,
  Settings,
  PawPrint,
  Calendar,
  Pill,
  Weight,
  Clock,
  FileText
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddPetDialog } from './AddPetDialog';

export default function Sidebar() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userId = 'current-user-id'; // Replace with actual auth

    const q = query(
      collection(db, 'pets'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const petsData: Pet[] = [];
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        petsData.push({ id: doc.id, ...doc.data() } as Pet);
      });
      setPets(petsData);

      // If no pet is selected and we have pets, select the first one
      if (!selectedPet && petsData.length > 0) {
        setSelectedPet(petsData[0].id);
        if (pathname === '/dashboard') {
          router.push(`/pets/${petsData[0].id}`);
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Extract pet ID from pathname if it exists
  useEffect(() => {
    const match = pathname.match(/\/pets\/([^/]+)/);
    if (match && match[1]) {
      setSelectedPet(match[1]);
    }
  }, [pathname]);

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handlePetSelect = (petId: string) => {
    setSelectedPet(petId);
    router.push(`/pets/${petId}`);
  };

  return (
    <div className="flex h-screen w-72 flex-col border-r bg-card">
      <div className="p-6">
        <h1 className="text-2xl font-bold">PetCare</h1>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-8">
          {/* Main Navigation */}
          <div className="space-y-2">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href && "bg-accent"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Pets Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">My Pets</h2>
              <AddPetDialog />
            </div>

            {/* Pets List */}
            <div className="space-y-1">
              {pets.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">
                  No pets added yet
                </p>
              ) : (
                pets.map((pet) => (
                  <Button
                    key={pet.id}
                    variant={selectedPet === pet.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handlePetSelect(pet.id)}
                  >
                    <PawPrint className="mr-2 h-4 w-4" />
                    {pet.name}
                  </Button>
                ))
              )}
            </div>
          </div>

          {/* Pet Sections - Only show if a pet is selected and we're on a pet page */}
          {selectedPet && pathname.includes('/pets/') && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">
                Pet Details
              </h2>
              <div className="space-y-1">
                {[
                  { name: 'Overview', href: `/pets/${selectedPet}`, icon: PawPrint },
                  { name: 'Appointments', href: `/pets/${selectedPet}/appointments`, icon: Calendar },
                  { name: 'Medications', href: `/pets/${selectedPet}/medications`, icon: Pill },
                  { name: 'Weight Tracking', href: `/pets/${selectedPet}/weight`, icon: Weight },
                  { name: 'Feeding Schedule', href: `/pets/${selectedPet}/feeding`, icon: Clock },
                  { name: 'Notes', href: `/pets/${selectedPet}/notes`, icon: FileText },
                ].map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.name}
                      variant={pathname === section.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => router.push(section.href)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {section.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}