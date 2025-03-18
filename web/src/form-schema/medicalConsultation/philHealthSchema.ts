import { z } from "zod";



export const PhilHealthSchema = z.object({
  isTransient: z.string().default("Resident"),
  atc:z.string().min(1,"Please Select"),
  pin:z.number().min(1,"Pin is required"),
  memberORdependent:z.string().min(1,"please select"),
  contactNo: z.number(), 
  fname: z.string().min(1, "First Name is required"),
  lname: z.string().min(1, "Last Name is required"),
  mname: z.string(),
  date: z.string().min(1, "Date is required"),
  age: z.number().min(1, "Age is required"),
  sex: z.string().min(1, "Sex is required"),
  status:z.string().min(1,"Status is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  houseno: z.string().optional(),
  street: z.string().optional(),
  sitio: z.string().optional(),
  barangay: z.string().min(1, "Barangay is required"),
  province: z.string().optional(),
  city: z.string().optional(),
  bhwAssign: z.string().min(1, "BHW Assignment is required"),
  hr: z.number().min(1, "Heart rate is required"),
  bpsystolic: z.number().min(1, "Blood pressure Systolic is required"),
  bpdiastolic: z.number().min(1, "Blood pressure Diastolic is required"),
  rrc: z.number().min(1, "Respiratory Rate Count is required"),
  temp: z.number().min(1, "Temperature is required"),
  ht: z.number(),
  wt: z.number(),
  chiefComplaint: z.string(),
  doctor: z.string().min(1,"Doctor is required")
});

export type PhilHealthType = z.infer<typeof PhilHealthSchema>
