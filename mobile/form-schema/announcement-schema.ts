import { z } from "zod";

// Helper: convert Date/string into ISO "YYYY-MM-DDTHH:mm"
function toISO(date: string | Date): string {
  let d: Date;

  if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date);
  }

  if (isNaN(d.getTime())) return ""; // invalid date
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

// Reusable datetime field schema
const optionalDatetimeField = z
  .union([z.string(), z.date()])
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    return toISO(val);
  });

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
  ar_category: z.string().optional(),
  ann_to_sms: z.boolean().optional().default(false),
  ann_to_email: z.boolean().optional().default(false),
  staff_group: z.string().optional(),
});

export default AnnouncementSchema;
