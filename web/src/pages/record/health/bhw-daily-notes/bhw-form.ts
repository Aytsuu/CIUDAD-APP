import z from "zod"
import { positiveNumberSchema } from "@/helpers/PositiveNumber"

// Optional number schema that allows empty strings
const optionalPositiveNumber = z.union([
   z.string().transform(val => val === "" ? undefined : parseFloat(val)),
   z.number(),
   z.undefined()
]).optional().refine(
   val => val === undefined || val === null || (typeof val === 'number' && val >= 0),
   { message: "Value must be a positive number" }
)

export const BHWFormSchema = z.object({
   staffId: z.string().min(1, "Staff ID is required"),
   pat_id: z.string().optional(),
   dateToday: z.string().min(1, "Date is required"),
   description: z.string().optional(),
   age: z.string().optional(),
   gender: z.enum(["Male", "Female"]).optional(),
   weight: optionalPositiveNumber,
   height: optionalPositiveNumber,
   muac: optionalPositiveNumber, 
   nutritionalStatus: z.object({ 
      wfa: z.string(),
      lhfa: z.string(),
      wfh: z.string(),
      muac: optionalPositiveNumber,
      muac_status: z.string(),
   }).optional(),
   illnesses: z.array(z.object({
      illnessName: z.string().min(1, "Illness/Disease name is required"),
      count: positiveNumberSchema
   })).optional(),
   numOfWorkingDays: optionalPositiveNumber,
   daysPresent: optionalPositiveNumber,
   daysAbsent: optionalPositiveNumber,
   notedBy: z.string().optional(),
   approvedBy: z.string().optional(),
})