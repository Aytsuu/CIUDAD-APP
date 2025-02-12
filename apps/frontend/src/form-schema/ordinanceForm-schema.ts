import { z } from "zod"

// Shaping the complain form schema

const ordinanceFormSchema = z.object({
    
    ordTitle: z.string().min(1, 'Ordinance title is required'),
    ordDate: z.string().date(),
    ordDescription: z.string(),
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

export default ordinanceFormSchema;