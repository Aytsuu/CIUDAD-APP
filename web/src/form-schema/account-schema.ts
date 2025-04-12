import { z } from "zod"

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
