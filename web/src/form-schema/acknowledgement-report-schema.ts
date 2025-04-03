import { z } from 'zod';

const ARSchema = z.object({
    name: z.string().min(2, 'Must be atleast 2 characters.' ),
    dateStarted: z.string().date(),
    timeStarted: z.string().time(),
    dateCompleted: z.string().date(),
    timeCompleted: z.string().date(),
    sitio: z.string().min(1, 'Required.' ),
    location: z.string().min(2, 'Must be atleast 2 characters.' ),
    action: z.string().min(1, 'Required.' ),

    img: z.instanceof(File)
    .refine(file => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),
        'Only JPEG/JPG, or PNG, files are allowed!' 
    )
    .refine(file => file.size <= 5 * 1024 * 1024, 
        'File size must be less than 5MB!'
    )
})

export default ARSchema;