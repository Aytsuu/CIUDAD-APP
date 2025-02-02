import { z } from 'zod';

const ARSchema = z.object({
    name: z.string().min(2, { message: 'Name must be atleast 2 characters.' }),
    dateStarted: z.string().date(),
    timeStarted: z.string().time(),
    dateCompleted: z.string().date(),
    timeCompleted: z.string().date(),
    sitio: z.string().min(1, { message: 'Sitio is required.' }),
    address: z.string().min(2, { message: 'Address must be atleast 2 characters.' }),
    action: z.string().min(1, { message: 'Action taken is required' }),

    img: z.instanceof(File)
    .refine(file => ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type),{
        message: 'Only JPEG/JPG, or PNG, files are allowed!' 
    })
    .refine(file => file.size <= 5 * 1024 * 1024, {
        message: 'File size must be less than 5MB!'
    })
})

export default ARSchema;