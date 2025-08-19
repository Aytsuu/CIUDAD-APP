import { z } from "zod"


export const minutesOfMeetingFormSchema = z.object({
    
    meetingTitle: z.string().min(1, 'Meeting title is required'),
    meetingAgenda: z.string().min(1, 'Meeting agenda is required'),
    meetingDate: z.string().date(),
    // meetingDescription: z.string(),
    meetingAreaOfFocus: z.array(z.string()).nonempty("Please select at least 1 area of focus"),
    // meetingFile: z.array(z.object({
    //             name: z.string(),
    //             type: z.string(),
    //             path: z.string(),
    //             uri: z.string(),
    // })).min(1, 'This field is required'),
    // meetingSuppDoc: z.array(z.object({
    //             name: z.string(),
    //             type: z.string(),
    //             path: z.string(),
    //             uri: z.string(),
    // })).optional()

});

export const minutesOfMeetingEditFormSchema = z.object({
    
    meetingTitle: z.string().min(1, 'Meeting title is required'),
    meetingAgenda: z.string().min(1, 'Meeting agenda is required'),
    meetingDate: z.string().min(1, 'Meeting date is required'),
    meetingAreaOfFocus: z.array(z.string()).nonempty("Please select at least 1 area of focus"),
    mom_id: z.number().default(0),
});