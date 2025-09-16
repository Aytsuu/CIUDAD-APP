import { z } from "zod";

export const accountFormSchema = z.object({
  email: z.string()
    .email({ message: "Invalid email (ex. juanlitoy243@gmail.com)" })
    .refine((val) => {
      const domain = val.split("@")[1] || "";
      return domain.includes(".") && domain.split(".").pop()!.length <= 4; // common TLDs
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
  password: z.string()
    .superRefine((val, ctx) => {
      const errors = [];
      
      if (val.length < 6) {
        errors.push("Password must be at least 6 characters long");
      }
      
      if (!/[a-z]/.test(val)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      
      if (!/[A-Z]/.test(val)) {
        errors.push("Password must contain at least one uppercase letter");
      }
      
      if (!/\d/.test(val)) {
        errors.push("Password must contain at least one number");
      }
      
      if (errors.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errors.join("\n"), // Using newline instead of comma
        });
      }
    }),

  confirmPassword: z.string()
    .min(1, "Confirm Password is required")
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Password does not match",
  path: ["confirmPassword"]
});

export const accountUpdateSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional(  ),

  newPassword: z.string()
    .superRefine((val, ctx) => {
      const errors = [];
      
      if (val.length < 6) {
        errors.push("Password must be at least 6 characters long");
      }
      
      if (!/[a-z]/.test(val)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      
      if (!/[A-Z]/.test(val)) {
        errors.push("Password must contain at least one uppercase letter");
      }
      
      if (!/\d/.test(val)) {
        errors.push("Password must contain at least one number");
      }
      
      if (errors.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: errors.join("\n"), // Using newline instead of comma
        });
      }
    }),

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
  add_barangay: z.string().min(1).default("San Roque (ciudad)"),
  add_external_sitio: z.string().min(1),
  sitio: z.string().min(1),
  add_street: z.string().min(1)
})

export const personalInfoSchema = z.object({
  per_id: z.string(),
  per_suffix: z.string(),
  per_sex: z.string().min(1, "Sex is required"),
  per_dob: z.string().min(1, "Date of Birth is required"),
  per_status: z.string().min(1, "Status is required"),
  per_address: z.string().min(1, 'Address is required'),
  per_edAttainment: z.string(),
  per_religion: z.string().min(1, "Religion is required"),
  
  per_lname: z.string()
    .min(1, "Last Name is required")
    .min(2, "Last Name must be at least 2 letters"),

  per_fname: z.string()
    .min(1, "First Name is required")
    .min(2, "First Name must be at least 2 letters"),

  per_mname: z.string()
    .refine((val) => val === "" || val.length >= 2, "Middle Name must be at least 2 letters")
    .optional(),

  per_edAttainment: z.string()
    .refine((val) => val === "" || val.length >= 2, {
      message: "Educational Attainment must be at least 2 letters",
    })
    .optional(),

  per_contact: z.string()
    .min(1, "Contact is required")
    .regex(
      /^09\d{9}$/,
      "Must be a valid mobile number (e.g., 09171234567)"
    )
    .refine((val) => val.length === 11, {
      message: "Must be 11 digits (e.g., 09171234567)",
    }),
  per_disability: z.string(),
  per_addresses: z.object({
    list: z.array(addressSchema).default([]),
    new: addressSchema
  }),
})  

export const uploadIdSchema = z.object({
  selected: z.string().min(1, "ID selection is required"),
  imageURI: z.string()

})

export const photoSchema = z.object({
  imageURI: z.string()
})


export const linkAccountSchema = z.object({
  id: z.string(),
  lname: z.string()
    .min(1, 'Last Name is required')
    .min(2, 'Last Name must be atleast 2 letters'),
  fname: z.string()
    .min(1, 'First Name is required')
    .min(2, 'First Name must be atleast 2 letters'),
  dob: z.string().min(1, 'Date of Birth is required'),
  contact: z.string()
    .min(1, "Contact is required")
    .regex(
      /^09\d{9}$/,
      "Must be a valid mobile number (e.g., 09171234567)"
    )
    .refine((val) => val.length === 11, {
      message: "Must be 11 digits (e.g., 09171234567)",
    }),
})

export const familyFormSchema = z.object({
  fam_id: z.string(),
  fam_role: z.string().min(1, "Please select a role in the family")
})
  
export const RegistrationFormSchema = z.object({
  accountFormSchema,
  personalInfoSchema,
  uploadIdSchema,
  photoSchema,
  linkAccountSchema,
  familyFormSchema,
  motherInfoSchema: personalInfoSchema.extend({
    role: z.string()
  }),
  fatherInfoSchema: personalInfoSchema.extend({
    role: z.string()
  }),
  guardianInfoSchema: personalInfoSchema.extend({
    role: z.string()
  }),
  dependentInfoSchema: z.object({
    list: z.array(personalInfoSchema).default([]),
    new: personalInfoSchema.extend({
      role: z.string()
    })
  }),
  businessRespondent: z.object({
    br_lname: z.string()
    .min(1, "Last Name is required")
    .min(2, "Last Name must be at least 2 letters"),

    br_fname: z.string()
      .min(1, "First Name is required")
      .min(2, "First Name must be at least 2 letters"),

    br_mname: z.string()
      .refine((val) => val === "" || val.length >= 2, "Middle Name must be at least 2 letters")
      .optional(),
    br_sex: z.string().min(1, "Sex is required"),
    br_dob: z.string().min(1, "Date of Birth is required"),
  })
})