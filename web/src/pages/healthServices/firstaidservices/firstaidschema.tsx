import { z } from "zod";
// Schema definition
export const FirstaidRequestArraySchema = z.object({
  pat_id: z.string(),
  firstaid: z.array(
    z.object({
      finv_id: z.string(),
      qty: z.number().int().min(0),
      reason: z.string().optional(),
    })
  ),
});

export type FirstaidRequestArrayType = z.infer<typeof FirstaidRequestArraySchema>;
