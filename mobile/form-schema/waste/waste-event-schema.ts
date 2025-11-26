import { z } from 'zod';

const WasteEventSchema = z.object({
    eventName: z.string().min(1, "Event name is required"),
    location: z.string().min(1, "Location is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Event time is required"),
    organizer: z.string().min(1, "Organizer is required"),
    eventDescription: z.string().optional(),
    eventSubject: z.string().optional(),
    selectedAnnouncements: z.array(z.string()).optional(),
});

export default WasteEventSchema;

export type WasteEventFormData = z.infer<typeof WasteEventSchema>;
