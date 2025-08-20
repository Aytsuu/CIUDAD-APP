import { z } from "zod";

export const EmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const VerificationSchema = z.object({
  code: z.string().min(6, "Code must be at least 6 characters").max(6, "Code must be exactly 6 characters"),
  email: z.string().email("Please enter a valid email address"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type EmailFormData = z.infer<typeof EmailSchema>;
export type VerificationFormData = z.infer<typeof VerificationSchema>;
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>;