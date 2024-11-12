'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Pet } from '../types';
import { 
  Home,
  PlusCircle,
  Settings,
  PawPrint,
  Calendar,
  Pill,
  Weight,
  Clock,
  FileText
} from 'lucide-react';

export default function Sidebar() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const pathname = usePathname();

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
      }
    });

    return () => unsubscribe();
  }, [selectedPet]);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Add Pet', href: '/pets/new', icon: PlusCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const petSections = [
    { name: 'Overview', href: `/pets/${selectedPet}`, icon: PawPrint },
    { name: 'Appointments', href: `/pets/${selectedPet}/appointments`, icon: Calendar },
    { name: 'Medications', href: `/pets/${selectedPet}/medications`, icon: Pill },
    { name: 'Weight Tracking', href: `/pets/${selectedPet}/weight`, icon: Weight },
    { name: 'Feeding Schedule', href: `/pets/${selectedPet}/feeding`, icon: Clock },
    { name: 'Notes', href: `/pets/${selectedPet}/notes`, icon: FileText },
  ];

  return (
    <div className="flex flex-col w-64 bg-white h-screen border-r">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">PetCare</h1>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                pathname === item.href
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        <div className="pt-4">
          <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            My Pets
          </div>
          {pets.length === 0 ? (
            <p className="px-4 py-2 text-sm text-gray-500">No pets added yet</p>
          ) : (
            pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet.id)}
                className={`w-full flex items-center px-4 py-2 text-sm rounded-lg ${
                  selectedPet === pet.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <PawPrint className="mr-3 h-5 w-5" />
                {pet.name}
              </button>
            ))
          )}
        </div>

        {selectedPet && (
          <div className="pt-4">
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Pet Sections
            </div>
            {petSections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.name}
                  href={section.href}
                  className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                    pathname === section.href
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {section.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
}