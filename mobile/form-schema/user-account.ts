import * as z from "zod";

export const UserAccoun = z.object({
  accountDetails: z.object({
    userName: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});
