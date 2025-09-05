import { z } from 'zod';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

const requiredDatetimeField = z
  .string()
  .nonempty({ message: "This field is required" })
  .refine((val) => datetimeLocalRegex.test(val), {
    message: "Invalid datetime format (must be yyyy-MM-ddTHH:mm or with seconds)",
  });

const AnnouncementSchema = z.object({
  ann_title: z.string().nonempty({ message: "Title is required" }),
  ann_details: z.string().nonempty({ message: "Details are required" }),

  ann_start_at: requiredDatetimeField, // REQUIRED NOW
  ann_end_at: requiredDatetimeField,   // REQUIRED NOW
  ann_event_start: z.string().optional(), // keep optional
  ann_event_end: z.string().optional(),   // keep optional

  ann_type: z.string().nonempty({ message: "Type is required" }),
  ar_type: z.array(z.string()).optional().default([]),
  staff: z.string().optional(),
  ar_category: z.string().nonempty({ message: "Recipient is required" }),
  ann_to_sms: z.boolean().optional().default(false),
  ann_to_email: z.boolean().optional().default(false),
  staff_group: z.string().optional(), 
});

export default AnnouncementSchema;
