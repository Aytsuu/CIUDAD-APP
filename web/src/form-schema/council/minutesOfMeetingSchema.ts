import { z } from "zod"


export const minutesOfMeetingFormSchema = z.object({
    
    meetingTitle: z.string().min(1, 'Meeting title is required'),
    meetingAgenda: z.string().min(1, 'Meeting agenda is required'),
    meetingDate: z.string().date(),
    // meetingDescription: z.string(),
    meetingAreaOfFocus: z.array(z.string()).nonempty("Please select at least 1 area of focus"),
});

export const minutesOfMeetingEditFormSchema = z.object({
    
    meetingTitle: z.string().min(1, 'Meeting title is required'),
    meetingAgenda: z.string().min(1, 'Meeting agenda is required'),
    meetingDate: z.string().date(),
    // meetingDescription: z.string(),
    meetingAreaOfFocus: z.array(z.string()).nonempty("Please select at least 1 area of focus"),
    meetingFile: z.string().url("Please insert the meeting document").optional(),
    mom_id: z.number().default(0),
    momf_id: z.number().default(0),
});