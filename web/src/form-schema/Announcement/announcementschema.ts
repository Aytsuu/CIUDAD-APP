import { z } from 'zod';

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

const AnnouncementSchema = z.object({
  ann_title: z.string().nonempty({ message: "Title is required" }),
  ann_details: z.string().nonempty({ message: "Details are required" }),

  ann_start_at: z.string().optional().refine((val) => !val || datetimeLocalRegex.test(val), {
    message: "Invalid datetime format",
  }),
  ann_end_at: z.string().optional().refine((val) => !val || datetimeLocalRegex.test(val), {
    message: "Invalid datetime format",
  }),
  ann_event_start: z.string().optional().refine((val) => !val || datetimeLocalRegex.test(val), {
    message: "Invalid event start datetime format",
  }),
  ann_event_end: z.string().optional().refine((val) => !val || datetimeLocalRegex.test(val), {
    message: "Invalid event end datetime format",
  }),
  ann_type: z.string().nonempty({ message: "Type is required" }),
  ar_type: z.array(z.enum(["youth", "adult", "senior", "Midwife", "Doctor", "Barangay Health Worker", "Watchmen", "Waste Driver", "Waste Collector", "Barangay Captain"])).optional().default([]),
  staff: z.string().optional(),
  recipient: z.string().nonempty({ message: "Recipient is required" }),
  ann_to_sms: z.boolean().optional().default(false),
  ann_to_email: z.boolean().optional().default(false),  
})

export default AnnouncementSchema;
