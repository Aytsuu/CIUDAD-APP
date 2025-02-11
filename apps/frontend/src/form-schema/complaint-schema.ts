import { z } from "zod"

// Shaping the complain form schema

const ComplaintformSchema = z.object({
    
    accusedName: z.string().optional(),
    accusedAddress: z.string().min(1, 'Accused address is required'),
    complainantName: z.string().min(1, 'Complainant name is required'),
    complainantAddress: z.string().min(1, 'Complainant address is required'),
    complaintDate: z.string().min(1, 'Complaint date is required'),
    complaintType: z.string().min(1, 'Complaint type is required'),
    complaintAllegation: z.string({ message: " " }),

    complaintImg: z.instanceof(File)
    .refine(file => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type), {
        message: 'Only JPEG/JPG, or PNG, files are allowed!',
    })
    .refine(file => file.size <= 5 * 1024 * 1024, {
        message: 'File size must be less than 5MB!',
    })
    .nullable()

});

export default ComplaintformSchema;