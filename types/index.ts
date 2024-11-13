import { FieldValue } from 'firebase/firestore';

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  birthDate: string;
  imageUrl?: string | null;
  userId: string;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
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
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
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
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
}

export interface WeightRecord {
  id: string;
  petId: string;
  date: string;
  weight: number;
  unit: 'kg' | 'lbs';
  notes?: string;
  userId: string;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
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
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
}

export interface Note {
  id: string;
  petId: string;
  title: string;
  content: string;
  category?: 'behavior' | 'health' | 'general' | 'emergency';
  userId: string;
  createdAt: string | FieldValue;
  updatedAt: string | FieldValue;
}

export interface DashboardEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  petName: string;
  petId: string;  // Added petId
  createdAt: string;
}