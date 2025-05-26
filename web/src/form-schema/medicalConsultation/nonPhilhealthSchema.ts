import { z } from "zod";
import { positiveNumberSchema } from "@/helpers/PositiveNumber";

export const nonPhilHealthSchema = z.object({
  isTransient: z.string(),
  fname: z.string().min(1, "First Name is required").default(""),
  lname: z.string().min(1, "Last Name is required").default(""),
  mname: z.string().default(""),
  date: z.string().min(1, "Date is required").default(""),
  age: z.string(),  //z.number().min(1, "Age is Required"),
  sex: z.string().min(1, "Sex is Required").default(""),
  dob: z.string().min(1, "Date of Birth is required").default(""),

  houseno: z.string().default(""),
  street: z.string().default(""),
  sitio: z.string().default(""),
  barangay: z.string().min(1, "Barangay is required").default(""),
  province: z.string().default(""),
  city: z.string().default(""),
  bhwAssign: z.string().min(1, "BHW Assignment is Required").default(""),
  hr: positiveNumberSchema, //z.number().min(1, "Heart rate is required"),
  bpsystolic: positiveNumberSchema, //z.number().min(1, "Blood pressure Systolic is required"),
  bpdiastolic: positiveNumberSchema, //z.number().min(1, "Blood pressure Diastolic is required"),
  rrc: positiveNumberSchema, //z.number().min(1, "Respiratory Rate Count is required"),
  temp: positiveNumberSchema,           //z.number().min(1, "Temperature is required"),
  ht: z.number(),
  wt:positiveNumberSchema,
  chiefComplaint: z.string().default(""),
  doctor: z.string().min(1,"Doctor is required")

});




export type nonPhilHealthType = z.infer<typeof nonPhilHealthSchema>;
