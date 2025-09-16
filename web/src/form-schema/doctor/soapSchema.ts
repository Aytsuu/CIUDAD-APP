import { z } from "zod";
import { MedicineRequestArraySchema } from "@/form-schema/medicineRequest";



export const soapSchema = z.object({
  subj_summary: z.string().min(1, "Subjective summary is required"),
  followv: z.string().optional(),
  obj_summary: z.string().optional(),
  assessment_summary: z.string().optional().or(z.literal('')),
  plantreatment_summary: z.string().min(1, "Treatment plan is required"),
  medicineRequest: MedicineRequestArraySchema.optional(),
  physicalExamResults: z.array(z.number()).optional(),
  selectedIllnesses: z.array(z.number()).optional(),
});

export type SoapFormType = z.infer<typeof soapSchema>;
