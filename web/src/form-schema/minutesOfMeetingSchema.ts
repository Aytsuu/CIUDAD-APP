import { z } from "zod"


const minutesOfMeetingFormSchema = z.object({
    
    meetingTitle: z.string().min(1, 'Meeting title is required'),
    meetingAgenda: z.string().min(1, 'Meeting agenda is required'),
    meetingDate: z.string().date(),
    meetingDescription: z.string(),
    meetingAreaOfFocus: z.array(z.string()).nonempty(),

});

export default minutesOfMeetingFormSchema;