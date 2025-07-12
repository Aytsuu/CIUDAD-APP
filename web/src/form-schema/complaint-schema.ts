import { z } from "zod";

// Helper schemas
const phoneRegex = /^09\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  barangay: z.string().min(1, "Barangay is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  sitio: z.string().optional(),
});

export const personSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  middleName: z.string().max(50).optional(),
  suffix: z.string().max(10).optional(),
  // contactNumber: z.string()
  //   .min(11, "Contact number must be 11 digits")
  //   .max(11, "Contact number must be 11 digits")
  //   .regex(phoneRegex, "Invalid Philippine mobile number (09XXXXXXXXX)"),
  // email: z.string()
  //   .regex(emailRegex, "Invalid email format")
  //   .optional()
  //   .or(z.literal("")),
  address: addressSchema,
});

// export const accusedPersonSchema = personSchema.omit({ email: true });
export const accusedPersonSchema = personSchema;

export const accusedPersonSchema1 = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  middleName: z.string().max(50).optional(),
  suffix: z.string().max(10).optional(),
  alias: z.string().optional(),
  description: z.string().optional(),
  address: addressSchema,
})

export const incidentTypeEnum = z.enum([
  "Theft",
  "Assault",
  "Property Damage",
  "Noise",
  "Other"
]);

export const incidentSchema = z.object({
  type: incidentTypeEnum,
  otherType: z.string().optional(),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description cannot exceed 1000 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

export const fileSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['image', 'video', 'document']), // Added 'document' type
  name: z.string(),
  size: z.number(),
  file: z.instanceof(File).optional(), // Made file optional for existing uploads
  publicUrl: z.string().optional(),
  storagePath: z.string().optional(),
  status: z.enum(['uploading', 'uploaded', 'error']).optional(),
  previewUrl: z.string().optional()
}).refine(
  data => data.size <= 10 * 1024 * 1024,
  "File size must be less than 10MB"
).refine(
  data => {
    if (!data.file) return true; // Skip validation if no file (existing upload)
    const isImage = data.file.type.startsWith('image/');
    const isVideo = data.file.type.startsWith('video/');
    const isDocument = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(data.file.type);
    return isImage || isVideo || isDocument;
  },
  "Only image, video, and document files are allowed (PDF, DOC, DOCX)"
);

export const complaintFormSchema = z.object({
  complainant: personSchema,
  accused: z.array(accusedPersonSchema).min(1, "At least one accused is required"),
  incident: incidentSchema,
  documents: z.array(fileSchema).max(10, "Maximum 10 files allowed").optional(),
});

export type ComplaintFormData = z.infer<typeof complaintFormSchema>;