import { z } from 'zod';

export const ARFormSchema = z.object({
    ar_title: z.string().min(1),
    ar_date_started: z.string().date(),
    ar_time_started: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    ar_date_completed: z.string().date(),
    ar_time_completed: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    ar_action_taken: z.string().min(1, 'Required.' ),
})
