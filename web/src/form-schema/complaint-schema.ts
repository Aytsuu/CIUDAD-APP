import { z } from "zod";


// ------------------------------
//  ✪ CONSTANTS AND UTILITIES
// ------------------------------

const phoneRegex = /^09\d{9}$/;

export const incidentTypeEnum = z.enum([
  "Theft",
  "Assault",
  "Property Damage",
  "Noise",
  "Other"
]);

const genderEnum = z
  .enum(["Male", "Female", "Other", "Prefer not to say"], {
    errorMap: () => ({ message: "Required" }),
  });

// ------------------------------
//  ✪ ADDRESS 
// ------------------------------


export const addressSchema = z.object({
  street: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  sitio: z.string().optional(),
})
// .refine((data)=>
//     data.street.trim() &&
//     data.barangay.trim() &&
//     data.city.trim() &&
//     data.province.trim(),
//     {
//       path: ["street"],
//       message: "All address fields (Street, Barangay, City, Province) are required",
//     }
//   );

// -------------------------------------
//  ✪ PERSON ( COMPLAINANT / ACCUSED ) 
// -------------------------------------

export const complainant = z.object({
  fullName: z.string().min(1, "Name is required"),
  gender: genderEnum,
  customGender: z.string().optional(),
  age: z.string().min(1, "Age is required"),
  relation_to_respondent: z.string().min(1, "Relation is required"),
  contactNumber: z.string()
    .min(11, "Contact number must be 11 digits")
    .max(11, "Contact number must be 11 digits")
    .regex(phoneRegex, "Invalid mobile number (09XXXXXXXXX)"),
  address: addressSchema,
}).refine(
  (data) => data.gender !== "Other" || (data.customGender && data.customGender.trim().length > 0),
  {
    path: ["customGender"],
    message: "Please specify gender when 'Other is selected'",
  }
);

export const accused = z.object({
  alias: z.string().min(1, "Alias is required"),
  age: z.string().min(1, "Age is required"), 
  gender: z.string().min(1, "Gender is required"),
  genderInput: z.string().optional(), 
  description: z.string().min(5, "Description is required"),
  address: addressSchema,
}).refine(
  (data) => data.gender !== "Other" || (data.genderInput && data.genderInput.trim().length > 0),
  {
    path: ["genderInput"],
    message: "Please specify gender when 'Other' is selected",
  }
);

// -------------------------
//  ✪ INCIDENT INFORMATION 
// -------------------------
export const incidentSchema = z.object({
  location: z.string().min(1, "Location is required"),
  type: incidentTypeEnum,
  otherType: z.string().optional(),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
}).refine(
  (data) => data.type !== "Other" || (data.otherType && data.otherType.trim().length > 0),
  {
    path: ["otherType"],
    message: "Please specify the incident type when 'Other' is selected",
  }
);


// ---------
//  ✪ FILE 
// ---------
export const fileSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["image", "video", "document"]),
  name: z.string(),
  size: z.number(),
  file: z.instanceof(File).optional(),
  publicUrl: z.string().optional(),
  storagePath: z.string().optional(),
  status: z.enum(["uploading", "uploaded", "error"]).optional(),
  previewUrl: z.string().optional(),
})
  .refine(
    data => data.size <= 10 * 1024 * 1024,
    "File size must be less than 10MB"
  )
  .refine(
    data => {
      if (data.file) {
        const isImage = data.file.type.startsWith("image/");
        const isVideo = data.file.type.startsWith("video/");
        const isDocument = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(data.file.type);
        return isImage || isVideo || isDocument;
      }

      // If no File, validate based on .type or .name
      const ext = data.name.toLowerCase();
      const isValidType =
        data.type === "image" ||
        data.type === "video" ||
        data.type === "document";

      return isValidType && /\.(jpg|jpeg|png|gif|bmp|webp|mp4|mov|avi|webm|pdf|doc|docx)$/.test(ext);
    },
    "Only image, video, and document files are allowed (PDF, DOC, DOCX)"
  );


// -------------------------
//  ✪ MAIN COMPLAINT
// -------------------------
export const complaintFormSchema = z.object({
  complainant: z.array(complainant).min(1, "At least one complainant is required"),
  accused: z.array(accused).min(1, "At least one accused is required"),
  incident: incidentSchema,
  documents: z.array(fileSchema).max(10, "Maximum 10 files allowed").optional(),
});


// Type Inference
export type ComplaintFormData = z.infer<typeof complaintFormSchema>;
