import * as z from "zod";

export const accountSettings = z.object({
  email: z.string().email('Invalid email address'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});
