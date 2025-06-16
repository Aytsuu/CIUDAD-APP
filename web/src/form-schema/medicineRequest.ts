// import { z } from "zod";
// import { positiveNumberSchema } from "@/helpers/PositiveNumber";
// import { sign } from "crypto";


// export const MedicineRequestSchema = z.object({ 
//     pat_id :z.string().min(1, "Patient ID is required"),
//     minv_id: z.string().min(1, "Medicine is required"),
//     // signature: z.string().min(1, "Signature is required"),
//     reason: z.string().optional(),
//     medrec_qty:positiveNumberSchema

// })

// export type MedicineRequestType = z.infer<typeof MedicineRequestSchema>
import { z } from "zod";

export const MedicineRequestSchema = z.object({
  minv_id: z.string().min(1, "Medicine ID is required"),
  medrec_qty: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().optional()
});

export const MedicineRequestArraySchema = z.object({
  pat_id: z.string().min(1, "Patient ID is required"),
  medicines: z.array(MedicineRequestSchema).min(1, "At least one medicine is required"),
});

export type MedicineRequestArrayType = z.infer<typeof MedicineRequestArraySchema>;