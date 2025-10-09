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

  is_cbc: z.boolean().optional().default(false),
  is_urinalysis: z.boolean().optional().default(false),
  is_fecalysis: z.boolean().optional().default(false),
  is_sputum_microscopy: z.boolean().optional().default(false),
  is_creatine: z.boolean().optional().default(false),
  is_hba1c: z.boolean().optional().default(false),
  is_chestxray: z.boolean().optional().default(false),
  is_papsmear: z.boolean().optional().default(false),
  is_fbs: z.boolean().optional().default(false),
  is_oralglucose: z.boolean().optional().default(false),
  is_lipidprofile: z.boolean().optional().default(false),
  is_fecal_occult_blood: z.boolean().optional().default(false),
  is_ecg: z.boolean().optional().default(false),
  others: z.string().optional().default(''),
  is_phrecord: z.boolean().optional().default(false),
  phil_id:z.string().optional().default(''),
  staff_id: z.string().optional().default(''),
  medrec_id: z.string().optional().default(''),
  patrec_id: z.string().optional().default(''),



});

export type SoapFormType = z.infer<typeof soapSchema>;
