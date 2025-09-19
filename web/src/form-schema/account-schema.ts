import { z } from "zod";

export const SignInSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "" }),
  password: z.string().min(1, { message: "" }),
});


export const AccountUpdateSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional()
    .nullable(),

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

export const accountFormSchema = z.object({
  email: z.string().optional().nullable(),
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

  confirm_password: z
      .string()
      .min(1, { message: "Please confirm your password" }),
})
.refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export const passwordFormSchema = z
  .object({
    old_password: z
      .string()
      .min(1, { message: "Current password is required" }),
    new_password: z.string()
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
    confirm_password: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
