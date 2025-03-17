import { z } from "zod"

// Shaping the complain form schema

const AddEventFormSchema = z.object({
    
    eventTitle: z.string().min(1, 'Event title is required'),
    eventDate: z.string().date(),
    roomPlace: z.string().min(1, 'Room / Place is required'),
    eventCategory: z.string().min(1, 'Event category address is required'),
    eventTime: z.string().min(1, 'Event time is required'),
    eventDescription: z.string().min(1, 'Event Description is required'),
    barangayCouncil: z.array(z.string()).optional(),
    gadCommittee: z.array(z.string()).optional(),
    wasteCommittee: z.array(z.string()).optional(),


});

export default AddEventFormSchema;