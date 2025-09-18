import { z } from "zod";

// Address schema
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
  acsd_name: z.string().min(1, "Name/alias is required"), // Changed from alias
  acsd_age: z.string() // Changed from age
    .min(1, "Age is required")
    .refine((val) => {
      const age = parseInt(val);
      return !isNaN(age) && age >= 1 && age <= 150;
    }, "Age must be a valid number between 1 and 150"),
  acsd_gender: z.string().min(1, "Gender is required"), // Changed from gender
  genderInput: z.string().optional(),
  acsd_description: z.string().min(10, "Description must be at least 10 characters"), // Changed from description
  acsd_address: z.string().optional(), // Changed
  address: addressSchema.optional(),
});

// Incident schema - matches backend Complaint model fields
// In your complaint-schema.ts
const incidentSchema = z.object({
  comp_location: z.string().min(1, "Location is required"),
  comp_incident_type: z.string().min(1, "Incident type is required"),
  comp_allegation: z.string().min(20, "Description must be at least 20 characters"),
  comp_datetime: z.string().min(1, "Date and time is required"),
  // These are for UI only, not sent to backend
  date: z.string().optional(),
  time: z.string().optional(),
  otherType: z.string().optional(),
});


// Document/file schema - matches backend Complaint_File model
const documentSchema = z.object({
  comp_file_name: z.string(),
  comp_file_size: z.number(),
  comp_file_type: z.string(),
  status: z.enum(["uploading", "uploaded", "error"]),
  comp_file_url: z.string().optional(),
  error: z.string().optional(),
});

// Main complaint form schema
export const complaintFormSchema = z.object({
  complainant: z.array(complainantSchema)
    .min(1, "At least one complainant is required")
    .max(5, "Maximum 5 complainants allowed"),
  
  accused: z.array(accusedSchema)
    .min(1, "At least one accused person is required")
    .max(5, "Maximum 5 accused persons allowed"),
  
  incident: incidentSchema,
  
  documents: z.array(documentSchema)
    .max(10, "Maximum 10 files allowed")
    .optional(),
});


// TypeScript type inference
export type ComplaintFormData = z.infer<typeof complaintFormSchema>;
export type ComplainantData = z.infer<typeof complainantSchema>;
export type AccusedData = z.infer<typeof accusedSchema>;
export type IncidentData = z.infer<typeof incidentSchema>;
export type DocumentData = z.infer<typeof documentSchema>;

// Transform functions for backend compatibility
export const transformComplainantForBackend = (complainant: ComplainantData) => {
  let address = complainant.cpnt_address || "";
  
  // Build address string from address object if manual entry and no cpnt_address
  if (complainant.type === "manual" && !address && complainant.address) {
    address = [
      complainant.address.street,
      complainant.address.barangay,
      complainant.address.city,
      complainant.address.province,
      complainant.address.sitio
    ].filter(Boolean).join(", ");
  }

  return {
    cpnt_name: complainant.cpnt_name,
    cpnt_gender: complainant.genderInput || complainant.cpnt_gender,
    cpnt_number: complainant.cpnt_number,
    cpnt_age: complainant.cpnt_age,
    cpnt_relation_to_respondent: complainant.cpnt_relation_to_respondent,
    cpnt_address: address || "N/A",
    rp_id: complainant.rp_id || null,
  };
};

export const transformAccusedForBackend = (accused: AccusedData) => {
  let address = accused.acsd_address || "";
  
  if (accused.type === "manual" && !address && accused.address) {
    address = [
      accused.address.street,
      accused.address.barangay,
      accused.address.city,
      accused.address.province,
      accused.address.sitio
    ].filter(Boolean).join(", ");
  }

  return {
    acsd_name: accused.acsd_name,
    acsd_age: accused.acsd_age,
    acsd_gender: accused.genderInput || accused.acsd_gender,
    acsd_description: accused.acsd_description,
    acsd_address: address || "N/A",
    rp_id: accused.rp_id || null,
  };
};

export const transformIncidentForBackend = (incident: IncidentData) => {
  return {
    comp_incident_type: incident.comp_incident_type,
    comp_allegation: incident.comp_allegation,
    comp_location: incident.comp_location,
    comp_datetime: incident.comp_datetime,
  };
};

export const transformDocumentsForBackend = (documents: DocumentData[]) => {
  const uploadedFiles = documents.filter(
    (doc) => doc.status === "uploaded" && doc.comp_file_url
  );

  return uploadedFiles.map((doc) => ({
    comp_file_name: doc.comp_file_name,
    comp_file_type: doc.comp_file_type,
    comp_file_url: doc.comp_file_url,
  }));
};

