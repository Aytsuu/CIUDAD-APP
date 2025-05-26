import * as z from "zod";

export const announcementFormSchema = z.object({
  header: z.string().min(1, "Header is required"),
  details: z.string().min(1, "Details are required"),
  date: z.string().min(1,"Date is required"),
  image: z.string().nullable().optional(),
  modes: z.array(z.string()).nonempty("Modes are required"), 
  recipients: z.array(z.string()).nonempty("Recipients are required"), 
});

