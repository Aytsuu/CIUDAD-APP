import { z } from "zod";
const AddEventFormSchema = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventDate: z.string().min(1, "Event date is required"),
  roomPlace: z.string().min(1, "Room/Place is required"),
  eventCategory: z.enum(["meeting", "activity"]),
  eventTime: z.string().min(1, "Event time is required"),
  eventDescription: z.string().min(1, "Event description is required"),
  staffAttendees: z.array(z.string()),
});
export default AddEventFormSchema;