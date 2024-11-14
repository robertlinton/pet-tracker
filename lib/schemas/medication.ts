// lib/schemas/medication.ts
import * as z from "zod"

// Define common enums for consistent usage
export const medicationTypes = ['medication', 'vaccination', 'procedure'] as const;
export const medicationStatus = ['active', 'completed', 'discontinued', 'scheduled'] as const;
export const administrationRoutes = [
  'oral',
  'injection',
  'topical',
  'drops',
  'inhaled',
  'other'
] as const;

export const scheduleTypes = [
  'once',
  'daily',
  'twice_daily',
  'three_times_daily',
  'weekly',
  'monthly',
  'as_needed',
  'other'
] as const;

// Human readable labels
export const statusLabels = {
  active: 'Active',
  completed: 'Completed',
  discontinued: 'Discontinued',
  scheduled: 'Scheduled'
} as const;

export const typeLabels = {
  medication: 'Medication',
  vaccination: 'Vaccination',
  procedure: 'Procedure'
} as const;

export const routeLabels = {
  oral: 'Oral',
  injection: 'Injection',
  topical: 'Topical',
  drops: 'Drops',
  inhaled: 'Inhaled',
  other: 'Other'
} as const;

export const scheduleLabels = {
  once: 'One time only',
  daily: 'Once daily',
  twice_daily: 'Twice daily',
  three_times_daily: 'Three times daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  as_needed: 'As needed',
  other: 'Other'
} as const;

export const medicationFormSchema = z.object({
  name: z.string().min(1, "Medication name is required").max(100),
  type: z.enum(medicationTypes, {
    required_error: "Please select a type",
  }),
  // Basic Information
  date: z.string({
    required_error: "Please select a start date",
  }).regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").or(z.literal('')).default(''),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").or(z.literal('')).default(''),
  prescribedBy: z.string().max(100, "Name cannot exceed 100 characters").default(''),
  
  // Status and Schedule
  status: z.enum(medicationStatus).default('active'),
  administrationRoute: z.enum(administrationRoutes).default('oral'),
  schedule: z.enum(scheduleTypes).default('daily'),
  scheduleDetails: z.string().max(200, "Schedule details cannot exceed 200 characters").default(''),
  
  // Dosage Information
  dosage: z.string().max(100, "Dosage cannot exceed 100 characters").default(''),
  dosageUnit: z.string().max(20, "Unit cannot exceed 20 characters").default(''),
  frequency: z.string().max(100, "Frequency cannot exceed 100 characters").default(''),
  duration: z.string().max(100, "Duration cannot exceed 100 characters").default(''),
  
  // Prescription Details
  rxNumber: z.string().max(50, "RX number cannot exceed 50 characters").default(''),
  pharmacy: z.string().max(100, "Pharmacy name cannot exceed 100 characters").default(''),
  refillsTotal: z.number().min(0).default(0),
  refillsRemaining: z.number().min(0).default(0),
  
  // Additional Information
  reason: z.string().max(200, "Reason cannot exceed 200 characters").default(''),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").default(''),
  sideEffects: z.string().max(300, "Side effects cannot exceed 300 characters").default(''),
  
  // Completion Information
  completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").or(z.literal('')).default(''),
  completionNotes: z.string().max(300, "Completion notes cannot exceed 300 characters").default(''),
  
  // Reminders
  reminderEnabled: z.boolean().default(false),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").or(z.literal('')).default(''),
})

export type MedicationFormValues = z.infer<typeof medicationFormSchema>

export const defaultValues: MedicationFormValues = {
  name: '',
  type: 'medication',
  date: '',
  nextDueDate: '',
  endDate: '',
  prescribedBy: '',
  status: 'active',
  administrationRoute: 'oral',
  schedule: 'daily',
  scheduleDetails: '',
  dosage: '',
  dosageUnit: '',
  frequency: '',
  duration: '',
  rxNumber: '',
  pharmacy: '',
  refillsTotal: 0,
  refillsRemaining: 0,
  reason: '',
  notes: '',
  sideEffects: '',
  completedDate: '',
  completionNotes: '',
  reminderEnabled: false,
  reminderTime: '',
}

// Helper function to get badge variant based on status
export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'discontinued':
      return 'destructive';
    case 'scheduled':
      return 'outline';
    default:
      return 'default';
  }
}

// Helper function to get badge variant based on type
export const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case 'medication':
      return 'default';
    case 'vaccination':
      return 'secondary';
    case 'procedure':
      return 'outline';
    default:
      return 'default';
  }
}