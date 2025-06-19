import { z } from "zod";

// Define the schema with custom validation for householdNo

export const userAccountSchema = z.object({
  userName: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const verificationSchema = z.object({
  dob: z.string().date()
});

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
  imageURI: z.string()

})

export const photoSchema = z.object({
  imageURI: z.string()
})
  
export const RegistrationFormSchema = z.object({
  verificationSchema,
  userAccountSchema,
  personalInfoSchema,
  uploadIdSchema,
  photoSchema
})
