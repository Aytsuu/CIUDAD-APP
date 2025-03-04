import * as z from "zod";

export const announcementFormSchema = z.object({
  header: z.string().min(1, "Header is required"),
  details: z.string().min(1, "Details are required"),
  image: z.string().nullable().optional(),
  modes: z.array(z.string()).optional(),
  recipients: z.array(z.string()).optional(), 
});
