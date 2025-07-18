import { z } from "zod";
import { createImmunizationColumns } from "./columns";
import { VaccinesSchema } from "@/form-schema/chr-schema/chr-schema";

export const getCurrentDate = () => new Date().toISOString().split("T")[0];

export const vaccineRecordSchema = z.object({
  vacStck_id: z.string(),
  vac_id: z.string(),
  vac_name: z.string(),
  vaccineType: z.string(),
  dose: z.string(),
  date: z.string().default(getCurrentDate),
  expiry_date: z.string().optional(),
});

export const existingVaccineRecordSchema = z.object({
  vac_id: z.string(),
  vac_name: z.string(),
  vaccineType: z.string(),
  dose: z.string(),
  date: z.string().default(getCurrentDate),
});

export const VitalSignSchema = z.object({
  date: z.string().min(1, "Date is required"),
  age: z.string().min(1, "Age is required"),
  ht: z.string().optional(),
  wt: z.string().optional(),
  temp: z.string().optional(),
  notes: z.string().optional(),
  follov_description: z.string().optional(),

  followUpVisit: z.string().optional(),
  followv_id: z.string().optional(),
  chvital_id: z.string().optional(),
  bm_id: z.string().optional(),
  chnotes_id: z.string().optional(),
  followv_status: z.string().optional(),
});

export const ImmunizationFormSchema = VitalSignSchema.merge(VaccinesSchema);

export type VitalSignType = z.infer<typeof VitalSignSchema>;
export type FormData = z.infer<typeof ImmunizationFormSchema>;

export type VaccineRecord = z.infer<typeof vaccineRecordSchema>;
export type ExistingVaccineRecord = z.infer<typeof existingVaccineRecordSchema>;
export type ImmunizationFormData = z.infer<typeof ImmunizationFormSchema>;
// exp
