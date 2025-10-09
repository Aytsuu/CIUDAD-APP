import { z } from "zod"

const ordinanceFormSchema = z.object({
    ordTitle: z.string().min(1, 'Ordinance title is required'),
    ordTag: z.string().optional(),
    ordDesc: z.string().optional(),
    ordDate: z.string().min(1, 'Date is required'),
    ordDetails: z.string().min(1, 'Ordinance content is required'),
    ordAreaOfFocus: z.array(z.string()).min(1, 'At least one area of focus must be selected'),
    ordRepealed: z.boolean().optional().default(false),
});


export const amendOrdinanceSchema = z.object({
    ordTitle: z.string().min(1, 'Ordinance title is required'),
    ordTag: z.string().min(1, 'Please select an ordinance to amend'),
    ordDesc: z.string().optional(),
    ordDate: z.string().min(1, 'Date is required'),
    ordDetails: z.string().optional(),
    ordAreaOfFocus: z.array(z.string()).optional(),
    ordRepealed: z.boolean().optional().default(false),
});


export const repealOrdinanceSchema = z.object({
    ordTitle: z.string().min(1, 'Ordinance title is required'),
    ordTag: z.string().optional(),
    ordDesc: z.string().optional(),
    ordDate: z.string().min(1, 'Date is required'),
    ordDetails: z.string().optional(),
    ordAreaOfFocus: z.array(z.string()).optional(),
    ordRepealed: z.boolean().optional().default(true),
});

export default ordinanceFormSchema;