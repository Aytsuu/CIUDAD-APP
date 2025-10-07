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

const FileSchema = z.object({
  name: z.string(),
  type: z.string(),
  file: z.string().optional(),
});


export const MedicineRequestSchema = z.object({
  minv_id: z.string().optional(),
  medrec_qty: z.number().optional(),
  reason: z.string().optional(),
  med_type: z.string().optional(), // Add med_type field here
});

export const MedicineRequestArraySchema = z.object({
  pat_id: z.string(),
  medicines: z.array(MedicineRequestSchema),
  files: z.array(FileSchema).optional(), // Add files field here

});

export type MedicineRequestArrayType = z.infer<typeof MedicineRequestArraySchema>;