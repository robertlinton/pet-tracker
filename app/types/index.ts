export interface Pet {
    id: string;
    name: string;
    species: string;
    breed?: string;
    birthDate: string;
    imageUrl?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MedicalRecord {
    id: string;
    petId: string;
    petName: string;
    type: 'medication' | 'vaccination' | 'procedure';
    name: string;
    date: string;
    notes?: string;
    nextDueDate?: string;
    prescribedBy?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Appointment {
    id: string;
    petId: string;
    petName: string;
    date: string;
    time: string;
    type: 'checkup' | 'grooming' | 'emergency' | 'vaccination' | 'other';
    vetName?: string;
    clinic?: string;
    notes?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface WeightRecord {
    id: string;
    petId: string;
    date: string;
    weight: number;
    unit: 'kg' | 'lbs';
    notes?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface FeedingSchedule {
    id: string;
    petId: string;
    timeOfDay: string;
    foodType: string;
    amount: number;
    unit: 'cups' | 'grams' | 'oz';
    notes?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Note {
    id: string;
    petId: string;
    title: string;
    content: string;
    category?: 'behavior' | 'health' | 'general' | 'emergency';
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DashboardEvent {
    id: string;
    type: string;
    title: string;
    date: string;
    petName: string;
    createdAt: string;
  }