import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  barangay: z.string().min(1, "Barangay is required"),
  city: z.string().min(1, "City/Municipality is required"),
  province: z.string().min(1, "Province is required"),
  sitio: z.string().optional(),
});

const complainantSchema = z.object({
  type: z.enum(["manual", "resident"]).default("manual"),
  rp_id: z.string().nullable().optional(),
  cpnt_name: z.string().min(1, "Full name is required"),
  cpnt_gender: z.string().min(1, "Gender is required"),
  genderInput: z.string().optional(),
  cpnt_age: z.string()
    .min(1, "Age is required")
    .refine((val) => {
      const age = parseInt(val);
      return !isNaN(age) && age >= 1 && age <= 150;
    }, "Age must be a valid number between 1 and 150"),
  cpnt_relation_to_respondent: z.string().min(1, "Relationship to respondent is required"),
  cpnt_number: z.string()
    .min(1, "Contact number is required")
    .regex(/^[\d\s+()-]+$/, "Invalid contact number format"),
  cpnt_address: z.string().optional(),
  address: addressSchema.optional(),
});

const accusedSchema = z.object({
  type: z.enum(["manual", "resident"]).default("manual"),
  rp_id: z.string().nullable().optional(),
  acsd_name: z.string().min(1, "Name/alias is required"), 
  acsd_age: z.string() // Changed from age
    .min(1, "Age is required")
    .refine((val) => {
      const age = parseInt(val);
      return !isNaN(age) && age >= 1 && age <= 150;
    }, "Age must be a valid number between 1 and 150"),
  acsd_gender: z.string().min(1, "Gender is required"), 
  genderInput: z.string().optional(),
  acsd_description: z.string().min(10, "Description must be at least 10 characters"), 
  acsd_address: z.string().optional(), 
  address: addressSchema.optional(),
});

const incidentSchema = z.object({
  comp_location: z.string().min(1, "Location is required"),
  comp_incident_type: z.string().min(1, "Incident type is required"),
  comp_allegation: z.string().min(20, "Description must be at least 20 characters"),
  comp_datetime: z.string().min(1, "Date and time is required"),
  date: z.string().optional(),
  time: z.string().optional(),
  otherType: z.string().optional(),
});

export const complaintFormSchema = z.object({
  complainant: z.array(complainantSchema)
    .min(1, "At least one complainant is required")
    .max(5, "Maximum 5 complainants allowed"),

  accused: z.array(accusedSchema)
    .min(1, "At least one accused person is required")
    .max(5, "Maximum 5 accused persons allowed"),
  incident: incidentSchema,
  files: z.array(z.object({})).default([]),
}); 

export type ComplaintFormData = z.infer<typeof complaintFormSchema>;