import z from "zod";

// ------------------------------ //
// ✪ CONSTANTS AND UTILITIES
// ------------------------------ 
const phoneRegex = /^09\d{9}$/;

export const incidentTypeEnum = z.enum([
  "Theft",
  "Assault", 
  "Property Damage",
  "Noise",
  "Other"
]);

const genderEnum = z.enum(["Male", "Female", "Other"], {
  errorMap: () => ({ message: "Required" }),
});

// ------------------------------------- //
// ✪ PERSON ( COMPLAINANT / ACCUSED )
// ------------------------------------- 
export const complainant = z.object({
  cpnt_name: z.string().min(1, "Name is required"),
  cpnt_gender: genderEnum,
  cpnt_custom_gender: z.string().optional(),
  cpnt_age: z.string().min(1, "Age is required"),
  cpnt_relation_to_respondent: z.string().min(1, "Relation is required"),
  cpnt_number: z.string()
    .min(11, "Contact number must be 11 digits")
    .max(11, "Contact number must be 11 digits")
    .regex(phoneRegex, "Invalid mobile number (09XXXXXXXXX)"),
  cpnt_address: z.string().min(1, "Address is required"),
  rp_id: z.string().optional().nullable(), // For resident profile ID if available
}).refine(
  (data) => data.cpnt_gender !== "Other" || (data.cpnt_custom_gender && data.cpnt_custom_gender.trim().length > 0),
  {
    path: ["cpnt_custom_gender"],
    message: "Please specify gender when 'Other' is selected",
  }
);

export const accused = z.object({
  acsd_name: z.string().min(1, "Name/Alias is required"),
  acsd_age: z.string().min(1, "Age is required"), 
  acsd_gender: genderEnum, // Changed to use genderEnum like complainant
  acsd_custom_gender: z.string().optional(), 
  acsd_description: z.string().min(5, "Description is required"),
  acsd_address: z.string().min(1, "Address is required"),
  rp_id: z.string().optional().nullable(), // For resident profile ID if available
}).refine(
  (data) => data.acsd_gender !== "Other" || (data.acsd_custom_gender && data.acsd_custom_gender.trim().length > 0),
  {
    path: ["acsd_custom_gender"],
    message: "Please specify gender when 'Other' is selected",
  }
);

// ------------------------- //
// ✪ INCIDENT INFORMATION
// ------------------------- 
export const incidentSchema = z.object({
  comp_incident_type: incidentTypeEnum,
  comp_other_type: z.string().optional(),
  comp_location: z.string().min(1, "Location is required"),
  comp_allegation: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  comp_datetime: z.string().min(1, "Date is required"),
  comp_datetime_time: z.string().min(1, "Time is required"), // Added separate time field
}).refine(
  (data) => data.comp_incident_type !== "Other" || (data.comp_other_type && data.comp_other_type.trim().length > 0),
  {
    path: ["comp_other_type"],
    message: "Please specify the incident type when 'Other' is selected",
  }
);

// --------- //
// ✪ FILE
// --------- 
export const fileSchema = z.object({
  uri: z.string(),
  name: z.string(),
  type: z.string(),
  size: z.number().optional(),
});

// ------------------------- //
// ✪ MAIN COMPLAINT
// ------------------------- 
export const complaintFormSchema = z.object({
  complainant: z.array(complainant).min(1, "At least one complainant is required"),
  accused: z.array(accused).min(1, "At least one accused is required"),
  incident: incidentSchema,
  documents: z.array(fileSchema).max(10, "Maximum 10 files allowed").optional(),
});

// Type Inference
export type ComplaintFormData = z.infer<typeof complaintFormSchema>;