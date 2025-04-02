import { z } from 'zod';

const WasteEventSchedSchema = z.object({
    eventName: z.string().nonempty("Event name is required"), // Ensures the event name is a non-empty string
    location: z.string().nonempty("Location is required"), // Ensures the location is a non-empty string
    date: z.string().date().nonempty("Date is required"), // Ensures the date is a non-empty string
    time: z.string().min(1, 'Event time is required'), // Ensures the time is a non-empty string
    organizer: z.string().nonempty("Organizer is required"), // Ensures the organizer is a non-empty string
    invitees: z.string(), // Optional field for invitees
    eventDescription: z.string().optional(), // Optional field for event description
    eventSubject: z.string().optional(), // Optional field for event subject description
    selectedAnnouncements: z.array(z.string()).optional(), // Optional array of selected announcements
});

export default WasteEventSchedSchema;