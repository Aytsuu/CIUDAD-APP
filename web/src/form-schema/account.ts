import { z } from 'zod'

export const SignInSchema = z.object({

    usernameOrEmail: z.string().min(1, { message: ""}),
    password: z.string().min(1, { message: ""})

});

export const passwordFormSchema = z.object({
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


