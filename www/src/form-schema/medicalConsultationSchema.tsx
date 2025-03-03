import { z } from "zod";

export const nonPhilHealthSchema = z.object({
  isTransient: z.string().default("Resident"),
  fname: z.string().min(1, "First Name is required"),
  lname: z.string().min(1, "Last Name is required"),
  mname: z.string(),
  date: z.string().min(1, "Date is required"),
  age: z.number().min(1, "Age is Required"),
  sex: z.string().min(1, "Sex is Required"),
  dob: z.string().min(1, "Date of Birth is required"),

  houseno: z.string().optional(),
  street: z.string().optional(),
  sitio: z.string().optional(),
  barangay: z.string().min(1, "Barangay is required"),
  province: z.string().optional(),
  city: z.string().optional(),
  bhwAssign: z.string().min(1, "BHW Assignment is Required"),
  hr: z.number().min(1, "Heart rate is required"),
  bpsystolic: z.number().min(1, "Blood pressure Systolic is required"),
  bpdiastolic: z.number().min(1, "Blood pressure Diastolic is required"),
  rrc: z.number().min(1, "Respiratory Rate Count is required"),
  rrcmp: z.number().min(1, "Respiratory Rate cpm is Required"),
  temp: z.number().min(1, "Temperature is required"),
  ht: z.string(),
  wt: z.string(),
  chiefComplaint: z.string(),
});

export type nonPhilHealthType = z.infer<typeof nonPhilHealthSchema>;
