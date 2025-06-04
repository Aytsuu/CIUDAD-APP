import { z } from 'zod';

export const ARFormSchema = z.object({
    name: z.string().min(2, 'Must be atleast 2 characters.' ),
    dateStarted: z.string().date(),
    timeStarted: z.string().time(),
    dateCompleted: z.string().date(),
    timeCompleted: z.string().date(),
    sitio: z.string().min(1, 'Required.' ),
    location: z.string().min(2, 'Must be atleast 2 characters.' ),
    action: z.string().min(1, 'Required.' ),
})
