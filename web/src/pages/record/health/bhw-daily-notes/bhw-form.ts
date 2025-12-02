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

// Helpers for optional enum/object where empty string should be treated as undefined
const GenderEnum = z.enum(["Male", "Female"])
const optionalGender = z.preprocess(
   (val) => (val === "" || val === null ? undefined : val),
   GenderEnum
).optional()

const NutritionalStatusObj = z.object({
   wfa: z.string().optional().default(""),
   lhfa: z.string().optional().default(""),
   wfh: z.string().optional().default(""),
   muac: optionalPositiveNumber,
   muac_status: z.string().optional().default(""),
})
const optionalNutritionalStatus = z.preprocess(
   (val) => (val === "" || val === null ? undefined : val),
   NutritionalStatusObj
).optional()

export const BHWFormSchema = z.object({
   staffId: z.string().min(1, "Staff ID is required"),
   pat_id: z.string().optional(),
   dateToday: z.string().min(1, "Date is required"),
   description: z.string().optional(),
   age: z.string().optional(),
   gender: optionalGender,
   weight: optionalPositiveNumber,
   height: optionalPositiveNumber,
   muac: optionalPositiveNumber, 
   nutritionalStatus: optionalNutritionalStatus,
   illnesses: z.array(z.object({
      illnessName: z.string().min(1, "Illness/Disease name is required"),
      count: positiveNumberSchema
   })).optional(),
})