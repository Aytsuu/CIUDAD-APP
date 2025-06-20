import { z } from "zod";

export const passwordFormat = z.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })

export const accountFormSchema = z.object({
  username: z.string()
    .min(1, "Username is required")
    .min(6, "Username must be atleast 6 letters"),
  email: z.string()
    .email({ message: "Invalid email address" }),
  password: passwordFormat,
  confirmPassword: z.string()
    .min(1, "Confirm Password is required")
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Password does not match",
  path: ["confirmPassowrd"]
})

export const accountUpdateSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional(  ),

  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .optional(),

  profile_image: z
    .instanceof(File, { message: "Please upload a file" })
    .refine(
      file => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
      { message: "Only JPEG, PNG, GIF, or WEBP images are allowed" }
    )
    .refine(
      file => file.size <= 5 * 1024 * 1024,
      { message: "Image must be less than 5MB" }
    )
    .optional()
}).refine(data => data.newPassword || data.profile_image, {
  message: "Either password or profile image must be provided",
  path: ["form"]
});

export const verificationSchema = z.object({
  dob: z.string().date()
});

export const fileSchema = z.object({
  rf_name: z.string(),
  rf_type: z.string(),
  rf_path: z.string(),
  rf_url: z.string(),
  rf_is_id: z.boolean(),
  rf_id_type: z.string(),
})

export const addressSchema = z.object({
  add_province: z.string().min(1).default("Cebu"),
  add_city: z.string().min(1).default("Cebu City"),
  add_barangay: z.string().min(1).default("San Roque"),
  add_external_sitio: z.string().min(1),
  sitio: z.string().min(1),
  add_street: z.string().min(1)
})

export const personalInfoSchema = z.object({
  per_id: z.string(),
  per_lname: z.string().min(1, "Last Name is required"),
  per_fname: z.string().min(1, "First Name is required"),
  per_mname: z.string(),
  per_suffix: z.string(),
  per_sex: z.string().min(1, "Sex is required"),
  per_status: z.string().min(1, "Status is required"),
  per_edAttainment: z.string(),
  per_religion: z.string().min(1, "Religion is required"),
  per_contact: z.string().min(1, "Contact is required"),
  per_occupation: z.string(),
  per_addresses: z.object({
    list: z.array(addressSchema).default([]),
    new: addressSchema
  })
})  

export const uploadIdSchema = z.object({
  selected: z.string().min(1, "ID type selection is required"),
})

export const photoSchema = z.object({
  list: z.array(fileSchema).default([]),
})
  
export const RegistrationFormSchema = z.object({
  residentId: z.string().min(1, "Resident ID is required"),
  verificationSchema,
  accountFormSchema,
  personalInfoSchema,
  uploadIdSchema,
  photoSchema
})
