import * as z from "zod";

export const announcementFormSchema = z.object({
  ann_title: z.string().min(1, "Header is required"),
  ann_details: z.string().min(1, "Details are required"),
  ann_created_at: z.string().datetime().optional(),
});

