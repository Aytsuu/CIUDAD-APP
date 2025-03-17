import { z } from "zod"

// Shaping the complain form schema

const MarkAttendeesSchema = z.object({
    
    attendees: z.array(z.string()).optional(),

});

export default MarkAttendeesSchema;