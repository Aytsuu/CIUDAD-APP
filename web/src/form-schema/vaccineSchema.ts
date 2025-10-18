// form-schema/vaccineSchema.ts
import { z } from "zod";

// Combined schema for vaccine details and vital signs
export const VaccineSchema = z.object({
  // Vaccine details
  pat_id: z.string().min(1, "Patient ID is required"),
  vaccinetype: z.string().min(1, "Vaccine type is required"),
  datevaccinated: z.string().min(1, "Date vaccinated is required"),
  age: z.string().optional(),
  followv_date: z.string().optional(),
  vachist_doseNo: z.number().optional(),
  vacrec_totaldose: z.string().optional(),
  
  // Vital signs
  staff_id: z.string().optional(),
  patrec_id: z.string().optional(),
  pr: z.string().optional(),
  temp: z.string().optional(),
  o2: z.string().optional(),
  bpsystolic: z.string().optional(),
  bpdiastolic: z.string().optional(),
  selectedStaffId: z.string().optional()
});

export type VaccineSchemaType = z.infer<typeof VaccineSchema>;