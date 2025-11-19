import { z } from "zod";

// Address Schema
const addressSchema = z.object({
  add_province: z.string().min(1, "Province is required"),
  add_city: z.string().min(1, "City is required"),
  add_barangay: z.string().min(1, "Barangay is required"),
  add_street: z.string().min(1, "Street is required"),
  sitio: z.string().optional(),
  add_external_sitio: z.string().optional(),
});

// Personal Information Schema
export const personalInfoSchema = z.object({
  per_id: z.string().optional(),
  per_suffix: z.string().optional(),
  per_sex: z.string().min(1, "Sex is required"),
  per_dob: z.string().min(1, "Date of Birth is required"),
  per_status: z.string().min(1, "Civil Status is required"),
  per_religion: z.string().min(1, "Religion is required"),
  
  per_lname: z.string()
    .min(1, "Last Name is required")
    .min(2, "Last Name must be at least 2 letters"),

  per_fname: z.string()
    .min(1, "First Name is required")
    .min(2, "First Name must be at least 2 letters"),

  per_mname: z.string().optional(),

  per_edAttainment: z.string().optional(),

  per_contact: z.string()
    .min(1, "Contact is required")
    .regex(
      /^09\d{9}$/,
      "Must be a valid mobile number (e.g., 09171234567)"
    )
    .refine((val) => val.length === 11, {
      message: "Must be 11 digits (e.g., 09171234567)",
    }),
  per_disability: z.string().optional(),
  
  per_addresses: z.object({
    list: z.array(addressSchema).optional(),
    new: addressSchema.optional(),
  }).optional(),
});

// Account Schema
export const accountFormSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email (ex. juanlitoy243@gmail.com)" })
    .refine((val) => {
      const domain = val.split("@")[1] || "";
      return domain.includes(".") && domain.split(".").pop()!.length <= 4;
    }, {
      message: "Invalid email domain",
    }),
  phone: z.string()
    .min(1, "Contact is required")
    .regex(
      /^09\d{9}$/,
      "Must be a valid mobile number (e.g., 09171234567)"
    )
    .refine((val) => val.length === 11, {
      message: "Must be 11 digits (e.g., 09171234567)",
    }),
  // password: z.string()
  //   .superRefine((val, ctx) => {
  //     const errors = [];
      
  //     if (val.length < 6) {
  //       errors.push("Password must be at least 6 characters long");
  //     }
      
  //     if (!/[a-z]/.test(val)) {
  //       errors.push("Password must contain at least one lowercase letter");
  //     }
      
  //     if (!/[A-Z]/.test(val)) {
  //       errors.push("Password must contain at least one uppercase letter");
  //     }
      
  //     if (!/\d/.test(val)) {
  //       errors.push("Password must contain at least one number");
  //     }
      
  //     if (errors.length > 0) {
  //       ctx.addIssue({
  //         code: z.ZodIssueCode.custom,
  //         message: errors.join("\n"),
  //       });
  //     }
  //   }),

  // confirmPassword: z.string()
  //   .min(1, "Confirm Password is required")
})
// .refine((data) => data.password === data.confirmPassword, {
//   message: "Password does not match",
//   path: ["confirmPassword"]
// });

// Household Schema
export const householdFormSchema = z.object({
  householdHead: z.string().min(1, "Household head is required"),
  nhts: z.string().min(1, "NHTS status is required"),
  add_id: z.string().optional(),
  address: z.string().min(1, "Address is required"),
});

// Household Info Schema (for the form)
const householdInfoSchema = z.object({
  nhts: z.string().optional(),
  address: z.string().optional(),
});

// Demographic/Family Schema (Living Solo)
export const demographicInfoSchema = z.object({
  id: z.string().optional(), 
  building: z.string().min(1, "Building type is required"),
  householdNo: z.string().min(1, "Household number is required"),
  indigenous: z.string().min(1, "Indigenous status is required"),
});

// Family Join Schema (Register to existing family)
export const familyJoinSchema = z.object({
  familyId: z.string().min(1, "Family ID is required"),
  role: z.string().min(1, "Role in family is required")
});

// Complete Registration Schema (without business)
export const CompleteResidentProfilingSchema = z.object({
  personalSchema: personalInfoSchema,
  accountSchema: accountFormSchema,
  houseSchema: z.object({
    list: z.array(householdInfoSchema).default([]),
    info: householdInfoSchema
  }),
  livingSoloSchema: demographicInfoSchema,
  familySchema: familyJoinSchema,
});
