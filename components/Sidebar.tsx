'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
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
  FileText,
  LogOut,
  User,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddPetDialog } from './AddPetDialog';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'pets'),
      where('userId', '==', user.uid)
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
  }, [user, selectedPet]);

  // Extract pet ID from pathname if it exists
  useEffect(() => {
    const match = pathname.match(/\/pets\/([^/]+)/);
    if (match && match[1]) {
      setSelectedPet(match[1]);
    }
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not sign out. Please try again.",
      });
    }
  };

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handlePetSelect = (petId: string) => {
    setSelectedPet(petId);
    router.push(`/pets/${petId}`);
    setIsMobileOpen(false);
  };

  // The sidebar content component
  const SidebarContent = () => (
    <>
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-4">
          <Avatar>
            {user?.photoURL ? (
              <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
            ) : (
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <p className="font-medium">{user?.displayName || 'User'}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-8 py-6">
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

          {/* Pet Sections - Only show if a pet is selected */}
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
                      onClick={() => {
                        router.push(section.href);
                        setIsMobileOpen(false);
                      }}
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

      {/* User Actions */}
      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </>
  );

  // Mobile menu button
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      className="md:hidden fixed top-4 left-4 z-50"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
    >
      {isMobileOpen ? (
        <X className="h-5 w-5" />
      ) : (
        <Menu className="h-5 w-5" />
      )}
    </Button>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <MobileMenuButton />

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden",
          isMobileOpen ? "block" : "hidden"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Mobile Sidebar Content */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 bg-background transform transition-transform duration-200 ease-in-out md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen w-72 flex-col border-r bg-card fixed">
        <SidebarContent />
      </div>

      {/* Spacer for desktop layout */}
      <div className="hidden md:block w-72" />
    </>
  );
}