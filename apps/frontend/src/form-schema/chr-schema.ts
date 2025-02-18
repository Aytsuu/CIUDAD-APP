import { z } from 'zod'

const ChildHealthFormSchema = z.object({
  familyNo: z.string().min(1, 'required'),
  ufcNo: z.string().min(1, 'required'),
  childFname: z.string().min(1, 'required'),
  childLname: z.string().min(1, 'required'),
  childMname: z.string().min(1, 'required'),
  childSex: z.string().min(1, 'required'),
  childDob: z.string().min(1, 'required'),
  childPob: z.string().min(1, 'required'),
  motherFname: z.string().min(1, 'required'),
  motherLname: z.string().min(1, 'required'),
  motherMname: z.string().min(1, 'required'),
  motherAge: z.string().min(1, 'required'),
  motherOccupation: z.string().min(1, 'required'),
  fatherFname: z.string().min(1, 'required'),
  fatherLname: z.string().min(1, 'required'),
  fatherMname: z.string().min(1, 'required'),
  fatherAge: z.string().min(1, 'required'),
  fatherOccupation: z.string().min(1, 'required'),
  address: z.string().min(1, 'required'),
  landmarks: z.string().optional(),
  dateNewbornScreening: z.string().min(1, 'required'),
  screeningStatus: z.string().min(1, 'required'),
  birthWeight: z.string().optional(),
  birthLength: z.string().optional(),
  headCircumference: z.string().optional(),
  chestCircumference: z.string().optional(),
  deliveryType: z.string().optional(),
  gestationalAge: z.string().optional(),
  complications: z.string().optional(),
  hasDisability: z.boolean().optional(),
  disability: z.string().optional().default('N/A'),
  hasEdema: z.boolean().optional(),
  edemaSeverity: z.string().optional().default('N/A'),
  dates: z.array(z.string()).optional(),
  vitaminRecords: z
    .array(
      z.object({
        vitaminType: z.string(),
        date: z.string()
      })
    )
    .optional()
    .default([]),
  vaccines: z
    .array(
      z.object({
        id: z.number(),
        vaccineType: z.string(),
        dose: z.string(),
        date: z.string()
      })
    )
    .optional()
    .default([]),
  isTransient: z.string().default('resident'),

  ironDates: z
    .array(
      z.object({
        givenDate: z.string(),
        completedDate: z.string()
      })
    )
    .optional()
    .default([]),

  vitalSigns: z
    .array(
      z.object({
        age: z.string(),
        wt: z.string(),
        ht: z.string(),
        temp: z.string(),
        findings: z.string(),
        notes: z.string(),  
      })
    )
    .optional()
    .default([])
})

export type FormData = z.infer<typeof ChildHealthFormSchema>

export default ChildHealthFormSchema
