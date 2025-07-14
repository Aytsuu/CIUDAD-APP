import { z } from 'zod';

// export const SummonSuppDocSchema = z.object({
//     supp_doc: z.string().url("Please insert a supporting document."),
//     description: z.string().nonempty("This field is required.")
// })

export const SummonSuppDocSchema = z.object({
    supp_doc: z.string().min(1, "Please upload a supporting document"),
    description: z.string().min(1, "Description is required")
});