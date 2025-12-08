import { z } from "zod";

export const SignInSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: "" }),
  password: z.string().min(1, { message: "" }),
});


export const AccountUpdateSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional(),

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
  isVerifiedPhone: z.boolean(),
  isVerifiedEmail: z.boolean()
  })