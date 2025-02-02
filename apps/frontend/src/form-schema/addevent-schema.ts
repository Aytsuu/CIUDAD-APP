import { z } from "zod"

// Shaping the complain form schema

const AddEventFormSchema = z.object({
    
    eventTitle: z.string().min(1, 'Event title is required'),
    eventDate: z.string().min(1, 'Event date address is required'),
    roomPlace: z.string().min(1, 'Room / Place is required'),
    eventCategory: z.string().min(1, 'Event category address is required'),
    eventTime: z.string().min(1, 'Event time is required'),
    eventDescription: z.string().min(1, 'Event Description is required'),
    barangayCouncil: z.array(z.string()).optional(),
    gadCommittee: z.array(z.string()).optional(),
    wasteCommittee: z.array(z.string()).optional(),
    // gadCommittee: z.string({ message: " " }),  
    // wasteCommittee: z.string({ message: " " }),  

    // complaintImg: z.instanceof(File)
    // .refine(file => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type), {
    //     message: 'Only JPEG/JPG, or PNG, files are allowed!',
    // })
    // .refine(file => file.size <= 5 * 1024 * 1024, {
    //     message: 'File size must be less than 5MB!',
    // })
    // .nullable()

});

export default AddEventFormSchema;