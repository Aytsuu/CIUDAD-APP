import { z } from "zod"

const ordinanceFormSchema = z.object({
    ordTitle: z.string().min(1, 'Ordinance title is required'),
    ordTag: z.string().optional(),
    ordDesc: z.string().optional(),
    ordDate: z.string().min(1, 'Date is required'), // Changed from .date() to .min(1)
    ordDetails: z.string().min(1, 'Ordinance content is required'),
    ordAreaOfFocus: z.array(z.string()).min(1, 'At least one area of focus must be selected'),
});

export default ordinanceFormSchema;