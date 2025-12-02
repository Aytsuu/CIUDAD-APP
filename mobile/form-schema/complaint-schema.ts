import z from "zod";

export const complainant = z.object({
  rp_id: z.string().optional().nullable(), 
  cpnt_name: z.string().optional(), 
  cpnt_gender: z.string().optional(), 
  cpnt_age: z.string().optional(), 
  cpnt_relation_to_respondent: z.string().min(1, "Relation to respondent is required"), // This remains required
  cpnt_number: z.string().optional(), 
  cpnt_address: z.string().optional(), 
})

export const accused = z.object({
  acsd_name: z.string().min(1, "Name is required"),
  acsd_age: z.string().min(1, "Age is required"), 
  acsd_gender: z.string().min(1, "Gender is required"),
  acsd_description: z.string().min(5, "Description is required"),
  acsd_address: z.string().min(1, "Address is required"),
  rp_id: z.string().optional().nullable(),
});

export const incidentSchema = z.object({
  comp_incident_type: z.string().min(1, "Incident type is required"),
  comp_other_type: z.string().optional(),
  comp_location: z.string().min(1, "Location is required"),
  comp_allegation: z.string().min(20, "Description must be at least 20 characters"),
  comp_datetime: z.string().min(1, "Date is required"),
  comp_datetime_time: z.string().min(1, "Date amd Time is required"),
})

export const complaintFormSchema = z.object({
  complainant: z.array(complainant).min(1, "At least one complainant is required"),
  accused: z.array(accused).min(1, "At least one accused is required"),
  incident: incidentSchema,
  files: z.array(z.object({})).default([]),
});

export type ComplaintFormData = z.infer<typeof complaintFormSchema>;
