import { z } from "zod";

const datetimeLocalRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;

// Accepts Date or string, converts Date -> ISO string
const optionalDatetimeField = z
  .union([z.string(), z.date()])
  .optional()
  .refine(
    (val) =>
      !val ||
      val instanceof Date ||
      datetimeLocalRegex.test(val),
    {
      message:
        "Invalid datetime format ",
    }
  )
  .transform((val) =>
    val instanceof Date ? val.toISOString() : val || null
  );

const AnnouncementSchema = z.object({
  ann_title: z.string().nonempty({ message: "Title is required" }),
  ann_details: z.string().nonempty({ message: "Details are required" }),

  ann_start_at: optionalDatetimeField, 
  ann_end_at: optionalDatetimeField,   
  ann_event_start: optionalDatetimeField,
  ann_event_end: optionalDatetimeField,

  ann_type: z.string().nonempty({ message: "Type is required" }),
  ar_type: z.array(z.string()).optional().default([]),
  staff: z.string().optional(),
  ar_category: z.string().nonempty({ message: "Recipient is required" }),
  ann_to_sms: z.boolean().optional().default(false),
  ann_to_email: z.boolean().optional().default(false),
  staff_group: z.string().optional(),
  pos_category: z.string().optional(),
});

export default AnnouncementSchema;
