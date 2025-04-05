import { z } from "zod";

export const SignInSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "" }),
  password: z.string().min(1, { message: "" }),
});


export const AccountUpdateSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" }),

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


export const passwordFormSchema = z
  .object({
    old_password: z
      .string()
      .min(1, { message: "Current password is required" }),
    new_password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),
    confirm_password: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
