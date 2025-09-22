import { z } from "zod"

export const ordinanceUploadFormSchema = z.object({
    ordinanceTitle: z.string().min(1, 'Ordinance title is required'),
    ordinanceDate: z.string().min(1, 'Date is required'),
    ordinanceCategory: z.string().min(1, 'Category is required'),
    ordinanceDetails: z.string().min(1, 'Ordinance details are required'),
    ordinanceFile: z.string().url("Please upload the ordinance document"),
    ord_repealed: z.boolean().optional().default(false)
});

export const ordinanceUploadEditFormSchema = z.object({
    ordinanceTitle: z.string().min(1, 'Ordinance title is required'),
    ordinanceDate: z.string().min(1, 'Date is required'),
    ordinanceCategory: z.string().min(1, 'Category is required'),
    ordinanceDetails: z.string().min(1, 'Ordinance details are required'),
    ordinanceFile: z.string().url("Please upload the ordinance document"),
    ord_repealed: z.boolean().optional().default(false)
}); 