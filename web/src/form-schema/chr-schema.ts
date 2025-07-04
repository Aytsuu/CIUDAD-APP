import { z } from 'zod';



// export const BasicInfoSchema = z.object({
//   familyNo: z.string().min(1, 'required'),
//   pat_id: z.string().min(1, 'required'),
//   ufcNo: z.string().min(1, 'required'),
//   // childFname: z.string().min(1, 'required'),
//   // childLname: z.string().min(1, 'required'),
//   // childMname: z.string(),
//   // childSex: z.string().min(1, ' required'),
//   // childDob: z.string().min(1, 'required'),
//   childPob: z.string().min(1, 'required'), //
//   motherFname: z.string().min(1, 'required'),
//   motherLname: z.string().min(1, 'required'),
//   motherMname: z.string(),
//   motherAge: z.string().min(1, 'required'),
//   motherOccupation: z.string().min(1, 'required'),
//   fatherFname: z.string().min(1, 'required'),
//   fatherLname: z.string().min(1, 'required'),
//   fatherMname: z.string(),
//   fatherAge: z.string().min(1, 'required'),
//   fatherOccupation: z.string().min(1, 'required'),
//   // address: z.string().min(1, 'Address is required'),
//   landmarks: z.string().optional(),
//   // isTransient: z.string().default('Resident'),
//   // houseno: z.string(),
//   // street: z.string().optional(),
//   // sitio: z.string().optional(),
//   // barangay: z.string().min(1, "required"),
//   // province: z.string().optional(),
//   // city: z.string().optional(),
// });


export const BasicInfoSchema = z.object({
  familyNo: z.string().min(1, 'required'),
  pat_id: z.string().optional(),
  ufcNo: z.string().optional(),
  childFname: z.string().min(1, 'required'),
  childLname: z.string().min(1, 'required'),
  childMname: z.string(),
  childSex: z.string().min(1, 'required'),
  childDob: z.string().min(1, 'required'),
  childAge : z.string().min(1, 'required'), // Assuming this is calculated from childDob
  childPob: z.string().min(1, 'required'),
  motherFname: z.string().optional(),
  motherLname: z.string().optional(),
  motherMname: z.string().optional(),
  motherdob: z.string().optional(),

  motherAge: z.string().optional(),
  motherOccupation: z.string().optional(),
  fatherFname: z.string().optional(),
  fatherLname: z.string().optional(),
  fatherMname: z.string().optional(),
  fatherAge: z.string().optional(),
  fatherdob: z.string().optional(),

  fatherOccupation: z.string().optional(),
  residenceType: z.string().default('Resident'), // Default value for residence type
  address: z.string().optional(),
landmarks: z.string().optional(),
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
  dateNewbornScreening: z.string(),
});

export const Supplement = z.object({
  vitaminRecords: z
    .array(
      z.object({
        vitaminType: z.string(),
        date: z.string(),
      })
    )
    .optional()
    .default([]),
  ironDates: z
    .array(
      z.object({
        ironType: z.string(),
        givenDate: z.string(),
        completedDate: z.string(),
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
        vaccineType: z.string().min(1, 'required'),
        dose: z.string().min(1, 'required'),
        date: z.string().min(1, 'required'),
      })
    )
    .optional()
    .default([]),
});


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
  .merge(Supplement)
  .merge(VaccinesSchema)
  .extend({
    vitalSigns: z.array(VitalSignSchema).optional(), 
  });


// Type for FormData
export type FormData = z.infer<typeof ChildHealthFormSchema>;
export type BasicInfoType = z.infer<typeof BasicInfoSchema>;
export type VitalSignType = z.infer<typeof VitalSignSchema>;

export type SupplementType = z.infer<typeof Supplement>
export type VaccineType = z.infer<typeof VaccinesSchema>

