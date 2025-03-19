import { z } from 'zod';

<<<<<<< HEAD


export const BasicInfoSchema = z.object({
  familyNo: z.string().min(1, 'required'),
  ufcNo: z.string().min(1, 'required'),
  childFname: z.string().min(1, 'required'),
  childLname: z.string().min(1, 'required'),
  childMname: z.string(),
  childSex: z.string().min(1, ' required'),
  childDob: z.string().min(1, 'required'),
  childPob: z.string().min(1, 'required'),
  motherFname: z.string().min(1, 'required'),
  motherLname: z.string().min(1, 'required'),
  motherMname: z.string(),
  motherAge: z.string().min(1, 'required'),
  motherOccupation: z.string().min(1, 'required'),
  fatherFname: z.string().min(1, 'required'),
  fatherLname: z.string().min(1, 'required'),
  fatherMname: z.string(),
  fatherAge: z.string().min(1, 'required'),
  fatherOccupation: z.string().min(1, 'required'),
  // address: z.string().min(1, 'Address is required'),
  landmarks: z.string().optional(),
  isTransient: z.string().default('Resident'),
  houseno: z.string(),
  street: z.string().optional(),
  sitio: z.string().optional(),
  barangay: z.string().min(1, "required"),
  province: z.string().optional(),
  city: z.string().optional(),
});


=======
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
>>>>>>> frontend/feature/treasurer

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
<<<<<<< HEAD
  dateNewbornScreening: z.string(),
=======
>>>>>>> frontend/feature/treasurer
});

export const Supplement = z.object({
  vitaminRecords: z
    .array(
      z.object({
<<<<<<< HEAD
        vitaminType: z.string(),
        date: z.string(),
=======
        vitaminType: z.string().min(1, 'Vitamin type is required'),
        date: z.string().min(1, 'Date is required'),
>>>>>>> frontend/feature/treasurer
      })
    )
    .optional()
    .default([]),
  ironDates: z
    .array(
      z.object({
<<<<<<< HEAD
        ironType: z.string(),
        givenDate: z.string(),
        completedDate: z.string(),
=======
        ironType: z.string().min(1, 'Iron type is required'),
        givenDate: z.string().min(1, 'Given date is required'),
        completedDate: z.string().min(1, 'Completed date is required'),
>>>>>>> frontend/feature/treasurer
      })
    )
    .optional()
    .default([]),
});

<<<<<<< HEAD

=======
>>>>>>> frontend/feature/treasurer
export const VaccinesSchema = z.object({
  vaccines: z
    .array(
      z.object({
        id: z.number(),
<<<<<<< HEAD
        vaccineType: z.string().min(1, 'required'),
        dose: z.string().min(1, 'required'),
        date: z.string().min(1, 'required'),
=======
        vaccineType: z.string().min(1, 'Vaccine type is required'),
        dose: z.string().min(1, 'Dose is required'),
        date: z.string().min(1, 'Date is required'),
>>>>>>> frontend/feature/treasurer
      })
    )
    .optional()
    .default([]),
});

<<<<<<< HEAD

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


export const ChildHealthFormSchema = BasicInfoSchema.merge(ChildDetails)
=======
// Combined Schema
export const ChildHealthFormSchema = BasicInfo.merge(ChildDetails)
>>>>>>> frontend/feature/treasurer
  .merge(Supplement)
  .merge(VaccinesSchema)
  .extend({
    vitalSigns: z.array(VitalSignSchema).optional(),
  });

<<<<<<< HEAD

// Type for FormData
export type FormData = z.infer<typeof ChildHealthFormSchema>;
export type BasicInfoType = z.infer<typeof BasicInfoSchema>;
export type VitalSignType = z.infer<typeof VitalSignSchema>;

export type SupplementType = z.infer<typeof Supplement>
export type VaccineType = z.infer<typeof VaccinesSchema>

=======
// Type for FormData
export type FormData = z.infer<typeof ChildHealthFormSchema>;
export type VitalSignFormData = z.infer<typeof VitalSignSchema>;
>>>>>>> frontend/feature/treasurer
