// form-schema/council/addevent-schema.ts
import { z } from "zod";

export const AddEventFormSchema = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventDate: z.string().min(1, "Event date is required"),
  roomPlace: z.string().min(1, "Room/Place is required"),
  eventCategory: z.enum(["meeting", "activity"]),
  eventTime: z.string().min(1, "Event time is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  staffAttendees: z.array(z.string()),
});

export const UpdateEventFormSchema = z.object({
  eventTitle: z.string().optional(),
  eventDate: z.string().optional(),
  roomPlace: z.string().optional(),
  eventCategory: z.enum(["meeting", "activity"]).optional(),
  eventTime: z.string().optional(),
  eventDescription: z.string().optional(),
  staffAttendees: z.array(z.string()).optional(),
});
