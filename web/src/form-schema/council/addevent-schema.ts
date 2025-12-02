import { z } from "zod";

const AddEventFormSchema = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventDate: z.string().min(1, "Event date is required"),
  roomPlace: z.string().min(1, "Room/Place is required"),
  eventTime: z.string().min(1, "Event time is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  numRows: z
    .number()
    .min(0, "Number of rows cannot be negative")
    .max(1000, "Maximum 1000 attendees allowed")
    .optional(),
  staff_id: z.string().optional().nullable(),
});

export default AddEventFormSchema;