import { z } from "zod";

// Schema for vital signs
export const VitalSignsSchema = z.object({
  pr: z.string().min(1, "PR is required"),
  temp: z.string().min(1, "Temperature is required"),
  bp: z.string().min(1, "Blood Pressure is required"),
  o2: z.string().min(1, "O2 is required"),
});

// Main schema without vital signs
export const VaccineSchema = z.object({
  vaccinetype: z.string().min(1, "Vaccine is required"),
  datevaccinated: z.string().min(1, "Date is required"),
  lname: z.string().min(1, "Last name is Required"),
  fname: z.string().min(1, "First Name is required"),
  mname: z.string().optional(),
  age: z.string().min(1, "Age is required"),
  sex: z.string().min(1, "Sex is required"),
  dob: z.string().min(1, "DOB is required"),
  houseno: z.string().optional(),
  street: z.string().optional(),
  sitio: z.string().optional(),
  barangay: z.string().min(1, "Barangay is required"),
  province: z.string().optional(),
  city: z.string().optional(),
  assignto: z.string().min(1,"choose a person to do the vitalsigns")

});

// Combine the main schema with the vital signs schema
export const CombinedSchema = VaccineSchema.merge(VitalSignsSchema);

export default CombinedSchema;
