import { z } from "zod";

// Schema for vital signs
export const VitalSignsSchema = z.object({
  pr: z.string().min(1, "required"),
  temp: z.string().min(1, "required"),
  o2: z.string().min(1,"required"),
  bpsystolic: z.string().min(1,"required"),
  bpdiastolic: z.string().min(1,"required"),

}); 

// Schema for vaccine details
export const VaccineSchema = z.object({ 
  pat_id :z.string().min(1, "Patient ID is required"),
  vaccinetype: z.string().min(1, "Vaccine is required"),
  datevaccinated: z.string().min(1, "Date is required"),
  // lname: z.string().min(1, "Last name is Required"),
  // fname: z.string().min(1, "First Name is required"),
  // mname: z.string().optional(),
  age: z.string().min(1, "Age is required"),
  // sex: z.string().min(1, "Sex is required"),
  // dob: z.string().min(1, "DOB is required"),
  // householdno: z.string().optional(),
  // street: z.string().optional(),
  // sitio: z.string().optional(),
  // barangay: z.string().min(1, "Barangay is required"),
  // province: z.string().optional(),
  // city: z.string().optional(),
  assignto: z.string().min(1, "choose a person  to do the vitalsigns"),
  // signature: z.string().min(1, "signature is required"),
  // patientType: z.string().min(1, "Patient type is required"),

});

// Merge schemas
export const CombinedSchema = VaccineSchema.merge(VitalSignsSchema);

// Define TypeScript types from schemas
export type VaccineSchemaType = z.infer<typeof VaccineSchema>;
export type VitalSignsType = z.infer<typeof VitalSignsSchema>; 
export type CombineVaccineType = z.infer<typeof CombinedSchema>;

export default CombinedSchema;
