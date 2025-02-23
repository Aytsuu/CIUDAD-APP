import { z } from 'zod';

// Zod Schemas
export const VitalSignSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  age: z.string().min(1, 'Age is required'),
  ht: z.number().min(0, 'Height must be a positive number'),
  wt: z.number().min(0, 'Weight must be a positive number'),
  temp: z.number().min(30, 'Temperature must be realistic'),
  findings: z.string().optional(),
  notes: z.string().optional(),
  followUpVisit: z.string().optional(),
});

export const BasicInfo = z.object({
  familyNo: z.string().min(1, 'Family number is required'),
  ufcNo: z.string().min(1, 'UFC number is required'),
  childFname: z.string().min(1, 'Child first name is required'),
  childLname: z.string().min(1, 'Child last name is required'),
  childMname: z.string().min(1, 'Child middle name is required'),
  childSex: z.string().min(1, 'Child sex is required'),
  childDob: z.string().min(1, 'Child date of birth is required'),
  childPob: z.string().min(1, 'Child place of birth is required'),
  motherFname: z.string().min(1, 'Mother first name is required'),
  motherLname: z.string().min(1, 'Mother last name is required'),
  motherMname: z.string().min(1, 'Mother middle name is required'),
  motherAge: z.string().min(1, 'Mother age is required'),
  motherOccupation: z.string().min(1, 'Mother occupation is required'),
  fatherFname: z.string().min(1, 'Father first name is required'),
  fatherLname: z.string().min(1, 'Father last name is required'),
  fatherMname: z.string().min(1, 'Father middle name is required'),
  fatherAge: z.string().min(1, 'Father age is required'),
  fatherOccupation: z.string().min(1, 'Father occupation is required'),
  address: z.string().min(1, 'Address is required'),
  landmarks: z.string().optional(),
  isTransient: z.string().default('Resident'),
});

export const ChildDetails = z.object({
  hasDisability: z.boolean().optional(),
  disabilityTypes: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .optional()
    .default([]),
  hasEdema: z.boolean().optional(),
  edemaSeverity: z.string().optional().default('N/A'),
  BFdates: z.array(z.string()).optional(), // Remove if not needed
});

export const Supplement = z.object({
  vitaminRecords: z
    .array(
      z.object({
        vitaminType: z.string().min(1, 'Vitamin type is required'),
        date: z.string().min(1, 'Date is required'),
      })
    )
    .optional()
    .default([]),
  ironDates: z
    .array(
      z.object({
        ironType: z.string().min(1, 'Iron type is required'),
        givenDate: z.string().min(1, 'Given date is required'),
        completedDate: z.string().min(1, 'Completed date is required'),
      })
    )
    .optional()
    .default([]),
});

export const VaccinesSchema = z.object({
  vaccines: z
    .array(
      z.object({
        id: z.number(),
        vaccineType: z.string().min(1, 'Vaccine type is required'),
        dose: z.string().min(1, 'Dose is required'),
        date: z.string().min(1, 'Date is required'),
      })
    )
    .optional()
    .default([]),
});

// Combined Schema
export const ChildHealthFormSchema = BasicInfo.merge(ChildDetails)
  .merge(Supplement)
  .merge(VaccinesSchema)
  .extend({
    vitalSigns: z.array(VitalSignSchema).optional(),
  });

// Type for FormData
export type FormData = z.infer<typeof ChildHealthFormSchema>;
export type VitalSignFormData = z.infer<typeof VitalSignSchema>;
