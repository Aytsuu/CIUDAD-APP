import { z } from 'zod';

export const SummonSuppDocSchema = z.object({
    supp_doc: z.string().url("Please insert a supporting document."),
    description: z.string().nonempty("This field is required.")
})

