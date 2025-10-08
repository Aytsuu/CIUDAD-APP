import { z } from "zod";

const DataRequirement = z.union([
  z.string()
    .default("")
    .refine((val) => val.trim() !== "", { message: "This field is required" })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), { message: "Value must be a valid number" })
    .refine((val) => val >= 0, { message: "Value must be non-negative" })
    .refine((val) => val.toString().replace('.', '').length <= 8, { message: "Value must not exceed 8 digits before decimal" })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), { message: "Value must have up to 2 decimal places" }),
  z.number()
    .refine((val) => !isNaN(val), { message: "Value must be a valid number" })
    .refine((val) => val >= 0, { message: "Value must be non-negative" })
    .refine((val) => val.toString().replace('.', '').length <= 8, { message: "Value must not exceed 8 digits before decimal" })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), { message: "Value must have up to 2 decimal places" })
]);


export const AddEventFormSchema = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventDate: z.string().min(1, "Event date is required"),
  roomPlace: z.string().min(1, "Room/Place is required"),
  eventTime: z.string().min(1, "Event time is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  numRows: DataRequirement.optional(),
  staff_id: z.string().optional(),
});

export const UpdateEventFormSchema = z.object({
  eventTitle: z.string().optional(),
  eventDate: z.string().optional(),
  roomPlace: z.string().optional(),
  eventTime: z.string().optional(),
  eventDescription: z.string().optional(),
  numRows: DataRequirement.optional(),
  staff_id: z.string().optional(),
});