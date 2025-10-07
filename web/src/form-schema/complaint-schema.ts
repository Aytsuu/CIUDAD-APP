// import { z } from "zod";

// // Address schema
// const addressSchema = z.object({
//   street: z.string().min(1, "Street is required"),
//   barangay: z.string().min(1, "Barangay is required"),
//   city: z.string().min(1, "City/Municipality is required"),
//   province: z.string().min(1, "Province is required"),
//   sitio: z.string().optional(),
// });

// // Complainant schema - matches backend Complainant model
// const complainantSchema = z.object({
//   type: z.enum(["manual", "resident"]).default("manual"),
//   rp_id: z.string().nullable().optional(), // Optional resident profile ID
//   fullName: z.string().min(1, "Full name is required"),
//   gender: z.string().min(1, "Gender is required"),
//   genderInput: z.string().optional(),
//   age: z.string()
//     .min(1, "Age is required")
//     .refine((val) => {
//       const age = parseInt(val);
//       return !isNaN(age) && age >= 1 && age <= 150;
//     }, "Age must be a valid number between 1 and 150"),
//   relation_to_respondent: z.string().min(1, "Relationship to respondent is required"),
//   contactNumber: z.string()
//     .min(1, "Contact number is required")
//     .regex(/^[\d\s+()-]+$/, "Invalid contact number format"),
//   address: addressSchema,
// });

// // Accused schema - matches backend Accused model
// const accusedSchema = z.object({
//   type: z.enum(["manual", "resident"]).default("manual"),
//   rp_id: z.string().nullable().optional(), // Optional resident profile ID
//   alias: z.string().min(1, "Name/alias is required"),
//   age: z.string()
//     .min(1, "Age is required")
//     .refine((val) => {
//       const age = parseInt(val);
//       return !isNaN(age) && age >= 1 && age <= 150;
//     }, "Age must be a valid number between 1 and 150"),
//   gender: z.string().min(1, "Gender is required"),
//   genderInput: z.string().optional(),
//   description: z.string().min(10, "Description must be at least 10 characters"),
//   address: addressSchema,
// });

// // Incident schema - matches backend Complaint model fields
// const incidentSchema = z.object({
//   location: z.string().min(1, "Location is required"),
//   type: z.string().min(1, "Incident type is required"),
//   description: z.string().min(20, "Description must be at least 20 characters"),
//   date: z.string().min(1, "Date is required"),
//   time: z.string().min(1, "Time is required"),
// });

// // Document/file schema - matches backend Complaint_File model
// const documentSchema = z.object({
//   name: z.string(),
//   size: z.number(),
//   type: z.string(),
//   status: z.enum(["uploading", "uploaded", "error"]),
//   publicUrl: z.string().optional(),
//   storagePath: z.string().optional(),
//   error: z.string().optional(),
// });

// // Main complaint form schema
// export const complaintFormSchema = z.object({
//   complainant: z.array(complainantSchema)
//     .min(1, "At least one complainant is required")
//     .max(5, "Maximum 5 complainants allowed"),
  
//   accused: z.array(accusedSchema)
//     .min(1, "At least one accused person is required")
//     .max(5, "Maximum 5 accused persons allowed"),
  
//   incident: incidentSchema,
  
//   documents: z.array(documentSchema)
//     .max(10, "Maximum 10 files allowed")
//     .optional(),
// });

// // TypeScript type inference
// export type ComplaintFormData = z.infer<typeof complaintFormSchema>;
// export type ComplainantData = z.infer<typeof complainantSchema>;
// export type AccusedData = z.infer<typeof accusedSchema>;
// export type IncidentData = z.infer<typeof incidentSchema>;
// export type DocumentData = z.infer<typeof documentSchema>;

// // Validation helpers
// export const validateComplainantAge = (age: string): boolean => {
//   const ageNum = parseInt(age);
//   return !isNaN(ageNum) && ageNum >= 1 && ageNum <= 150;
// };

// export const validateContactNumber = (number: string): boolean => {
//   return /^[\d\s+()-]+$/.test(number) && number.length >= 10;
// };

// // Transform functions for backend compatibility
// export const transformComplainantForBackend = (complainant: ComplainantData) => {
//   const fullAddress = [
//     complainant.address.street,
//     complainant.address.barangay,
//     complainant.address.city,
//     complainant.address.province,
//   ]
//     .filter(Boolean)
//     .join(", ")
//     .toUpperCase();

//   return {
//     cpnt_name: complainant.fullName,
//     cpnt_gender: complainant.genderInput || complainant.gender,
//     cpnt_number: complainant.contactNumber,
//     cpnt_age: complainant.age,
//     cpnt_relation_to_respondent: complainant.relation_to_respondent,
//     cpnt_address: fullAddress,
//     rp_id: complainant.rp_id || null,
//   };
// };

// export const transformAccusedForBackend = (accused: AccusedData) => {
//   const fullAddress = [
//     accused.address.street,
//     accused.address.barangay,
//     accused.address.city,
//     accused.address.province,
//   ]
//     .filter(Boolean)
//     .join(", ")
//     .toUpperCase();

//   return {
//     acsd_name: accused.alias,
//     acsd_age: accused.age,
//     acsd_gender: accused.genderInput || accused.gender,
//     acsd_description: accused.description,
//     acsd_address: fullAddress,
//     rp_id: accused.rp_id || null,
//   };
// };

// export const transformIncidentForBackend = (incident: IncidentData) => {
//   const dateTimeString = `${incident.date}T${incident.time}`;
  
//   return {
//     comp_incident_type: incident.type,
//     comp_allegation: incident.description,
//     comp_location: incident.location,
//     comp_datetime: dateTimeString,
//   };
// };

// export const transformDocumentsForBackend = (documents: DocumentData[]) => {
//   const uploadedFiles = documents.filter(
//     (doc) => doc.status === "uploaded" && doc.publicUrl
//   );

//   return uploadedFiles.map((doc) => ({
//     cf_filename: doc.name,
//     cf_size: doc.size,
//     cf_type: doc.type,
//     cf_path: doc.publicUrl,
//     cf_storage_path: doc.storagePath,
//   }));
// };


import { z } from "zod";

// Address schema
const addressSchema = z.object({
  street: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  sitio: z.string().optional(),
});

// Complainant schema
const complainantSchema = z.object({
  type: z.enum(["manual", "resident"]).default("manual"),
  rp_id: z.string().nullable().optional(),
  fullName: z.string().optional(),
  gender: z.string().optional(),
  genderInput: z.string().optional(),
  age: z.string().optional(),
  relation_to_respondent: z.string().optional(),
  contactNumber: z.string().optional(),
  address: addressSchema.optional(),
});

// Accused schema
const accusedSchema = z.object({
  type: z.enum(["manual", "resident"]).default("manual"),
  rp_id: z.string().nullable().optional(),
  alias: z.string().optional(),
  age: z.string().optional(),
  gender: z.string().optional(),
  genderInput: z.string().optional(),
  description: z.string().optional(),
  address: addressSchema.optional(),
});

// Incident schema
const incidentSchema = z.object({
  location: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
});

// Document/file schema
const documentSchema = z.object({
  name: z.string().optional(),
  size: z.number().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  publicUrl: z.string().optional(),
  storagePath: z.string().optional(),
  error: z.string().optional(),
});

// Main complaint form schema
export const complaintFormSchema = z.object({
  complainant: z.array(complainantSchema).optional(),
  accused: z.array(accusedSchema).optional(),
  incident: incidentSchema.optional(),
  documents: z.array(documentSchema).optional(),
});

// TypeScript type inference
export type ComplaintFormData = z.infer<typeof complaintFormSchema>;
export type ComplainantData = z.infer<typeof complainantSchema>;
export type AccusedData = z.infer<typeof accusedSchema>;
export type IncidentData = z.infer<typeof incidentSchema>;
export type DocumentData = z.infer<typeof documentSchema>;

// Transform functions for backend compatibility
export const transformComplainantForBackend = (complainant: ComplainantData) => {
  const fullAddress = [
    complainant.address?.street,
    complainant.address?.barangay,
    complainant.address?.city,
    complainant.address?.province,
  ]
    .filter(Boolean)
    .join(", ")
    .toUpperCase();

  return {
    cpnt_name: complainant.fullName,
    cpnt_gender: complainant.genderInput || complainant.gender,
    cpnt_number: complainant.contactNumber,
    cpnt_age: complainant.age,
    cpnt_relation_to_respondent: complainant.relation_to_respondent,
    cpnt_address: fullAddress,
    rp_id: complainant.rp_id || null,
  };
};

export const transformAccusedForBackend = (accused: AccusedData) => {
  const fullAddress = [
    accused.address?.street,
    accused.address?.barangay,
    accused.address?.city,
    accused.address?.province,
  ]
    .filter(Boolean)
    .join(", ")
    .toUpperCase();

  return {
    acsd_name: accused.alias,
    acsd_age: accused.age,
    acsd_gender: accused.genderInput || accused.gender,
    acsd_description: accused.description,
    acsd_address: fullAddress,
    rp_id: accused.rp_id || null,
  };
};

export const transformIncidentForBackend = (incident: IncidentData) => {
  const dateTimeString = incident.date && incident.time 
    ? `${incident.date}T${incident.time}` 
    : null;

  return {
    comp_incident_type: incident.type,
    comp_allegation: incident.description,
    comp_location: incident.location,
    comp_datetime: dateTimeString,
  };
};

export const transformDocumentsForBackend = (documents: DocumentData[]) => {
  return documents?.map((doc) => ({
    cf_filename: doc.name,
    cf_size: doc.size,
    cf_type: doc.type,
    cf_path: doc.publicUrl,
    cf_storage_path: doc.storagePath,
  })) || [];
};