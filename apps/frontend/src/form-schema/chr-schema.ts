import { z } from 'zod'

export const VaccineSchema = z.object({
  id: z.number(),
  vaccineType: z.string().min(1, "Vaccine type is required"),
  dose: z.string().min(1, "Dose is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
});


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
  screeningStatus: z.string().min(1, 'required'), //naa sa reports but wala sa child health
  vaccines: z.array(VaccineSchema).optional(),
  hasDisability:z.string().optional()
})

export default ChildHealthFormSchema
