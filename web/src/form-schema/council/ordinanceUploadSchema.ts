import { z } from "zod"

export const ordinanceUploadFormSchema = z.object({
    ordTitle: z.string().optional(),
    ordTag: z.string().optional(),
    ordDesc: z.string().optional(),
    ordDate: z.string().optional(),
    ordDetails: z.string().optional(),
    ordAreaOfFocus: z.array(z.string()).optional(),
    ordRepealed: z.boolean().optional().default(false),
    ordinanceFile: z.string().optional(),
});

export const ordinanceUploadEditFormSchema = z.object({
    ordTitle: z.string().min(1, 'Ordinance title is required'),
    ordTag: z.string().optional(),
    ordDesc: z.string().optional(),
    ordDate: z.string().min(1, 'Date is required'),
    ordDetails: z.string().min(1, 'Ordinance details are required'),
    ordAreaOfFocus: z.array(z.string()).min(1, 'At least one area of focus must be selected'),
    ordRepealed: z.boolean().optional().default(false),
    ordinanceFile: z.string().url("Please upload the ordinance document"),
}); 