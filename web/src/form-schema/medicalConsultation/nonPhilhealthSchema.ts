import { z } from "zod";
import { positiveNumberSchema } from "@/helpers/PositiveNumber";

export const nonPhilHealthSchema = z.object({
  pat_id: positiveNumberSchema,
 

  bhw_assignment: z.string().min(1, "BHW Assignment is Required").default(""),
  vital_pulse: positiveNumberSchema, //z.number().min(1, "Heart rate is required"),
  vital_bp_systolic: positiveNumberSchema, //z.number().min(1, "Blood pressure Systolic is required"),
  vital_bp_diastolic: positiveNumberSchema, //z.number().min(1, "Blood pressure Diastolic is required"),
  vital_RR: positiveNumberSchema, //z.number().min(1, "Respiratory Rate Count is required"),
  vital_temp: positiveNumberSchema,           //z.number().min(1, "Temperature is required"),
  height:positiveNumberSchema,
  weight:positiveNumberSchema,
  
  medrec_chief_complaint: z.string().default(""),
  doctor: z.string().min(1,"Doctor is required")

});




export type nonPhilHealthType = z.infer<typeof nonPhilHealthSchema>;



