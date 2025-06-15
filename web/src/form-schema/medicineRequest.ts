import { z } from "zod";
import { positiveNumberSchema } from "@/helpers/PositiveNumber";
import { sign } from "crypto";


export const MedicineRequestSchema = z.object({ 
    pat_id :z.string().min(1, "Patient ID is required"),
    minv_id: z.string().min(1, "Medicine is required"),
    // signature: z.string().min(1, "Signature is required"),
    reason: z.string().optional(),
    medrec_qty:positiveNumberSchema

})

export type MedicineRequestType = z.infer<typeof MedicineRequestSchema>
