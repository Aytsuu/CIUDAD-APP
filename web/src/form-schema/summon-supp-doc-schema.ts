import { z } from 'zod';

export const SummonSuppDocSchema = z.object({
    // supp_doc: z.string().min(1, "Please upload a supporting document"),
    reason: z.string().min(1, "Description is required")
});

export const SummonSuppDocEditSchema = z.object({
    supp_doc: z.string().min(1, "Please upload a supporting document"),
    description: z.string().min(1, "Description is required"),
    csd_id: z.string().default('')
});