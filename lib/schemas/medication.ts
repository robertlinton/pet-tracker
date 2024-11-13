// lib/schemas/medication.ts

import * as z from "zod"

export const medicationFormSchema = z.object({
  type: z.enum(['medication', 'vaccination', 'procedure'], {
    required_error: "Please select a type",
  }),
  name: z.string().min(1, "Medication name is required").max(100),
  date: z.string({
    required_error: "Please select a start date",
  }).regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'custom'], {
    required_error: "Please select a frequency",
  }),
  dosage: z.string().min(1, "Dosage is required").max(100),
  reminder: z.boolean().default(false),
  duration: z.number().optional(),
  nextDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  prescribedBy: z.string().max(100, "Name cannot exceed 100 characters").optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  durationUnit: z.enum(['days', 'weeks', 'months']).optional(),
})

export type MedicationFormValues = z.infer<typeof medicationFormSchema>

export const defaultValues: MedicationFormValues = {
  type: 'medication',
  name: '',
  date: '',
  frequency: 'once',
  dosage: '',
  reminder: false,
}