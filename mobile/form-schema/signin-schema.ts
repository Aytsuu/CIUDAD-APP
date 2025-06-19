import { z } from "zod";

export const signInSchema = z.object({
  user_or_email: z.string().min(1, "Username or Email is required"),
  password: z.string().min(1, "Password is required"),
})