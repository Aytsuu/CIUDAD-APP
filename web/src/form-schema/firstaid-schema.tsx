// import { z } from "zod";
// import { positiveNumberSchema } from "@/helpers/PositiveNumber";
// import { sign } from "crypto";


// export const FirstaidRequestSchema = z.object({ 
//     pat_id :z.string().min(1, "Patient ID is required"),
//     minv_id: z.string().min(1, "Firstaid is required"),
//     // signature: z.string().min(1, "Signature is required"),
//     reason: z.string().optional(),
//     medrec_qty:positiveNumberSchema

// })

// export type FirstaidRequestType = z.infer<typeof FirstaidRequestSchema>
import { z } from "zod";

export const FirstaidRequestSchema = z.object({
  finv_id: z.string().min(1, "Firstaid ID is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().optional()
});

export const FirstaidRequestArraySchema = z.object({
  pat_id: z.string().min(1, "Patient ID is required"),
  firstaid: z.array(FirstaidRequestSchema).min(1, "At least one Firstaid is required"),
});

export type FirstaidRequestArrayType = z.infer<typeof FirstaidRequestArraySchema>;