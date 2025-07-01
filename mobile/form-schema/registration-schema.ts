import { z } from "zod";

// Define the schema with custom validation for householdNo

export const userAccountSchema = z.object({
  userName: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const verificationSchema = z.object({
  dob: z.string().date("Date of birth must be a valid date")
});

export const personalInfoSchema = z.object({
  per_id: z.string(),
  per_lname: z.string().min(1, "Last Name is required"),
  per_fname: z.string().min(1, "First Name is required"),
  per_mname: z.string(),
  per_suffix: z.string(),
  per_sex: z.string().min(1, "Sex is required"),
  per_status: z.string().min(1, "Status is required"),
  per_address: z.string().min(1, 'Address is required'),
  per_edAttainment: z.string(),
  per_religion: z.string().min(1, "Religion is required"),
  per_contact: z.string().min(1, "Contact is required"),
  per_occupation: z.string()
})  

export const uploadIdSchema = z.object({
  selected: z.string().min(1, "ID selection is required"),
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
