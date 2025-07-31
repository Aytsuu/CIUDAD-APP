import { z } from "zod";


// Base vaccine record schema
// export const vaccineRecordSchema = z.object({
//   vacStck_id: z.string(),
//   vac_id: z.string(),
//   vac_name: z.string(),
//   vaccineType: z.string(),
//   dose: z.string(),
//   date: z.string(),
//   expiry_date: z.string().optional(),
//   totalDoses: z.string().optional(),
//   nextFollowUpDate: z.string().optional(),
//   vacrec: z.string().optional(),
//   existingFollowvId: z.string().optional(), // Optional field for existing follow-up ID

// });

// // Existing vaccine record schema
// export const existingVaccineRecordSchema = z.object({
//   vac_id: z.string(),
//   vac_name: z.string(),
//   vaccineType: z.string(),
//   dose: z.string(),
//   date: z.string(),
//   hasExistingVaccination: z.boolean().default(true),
//   totalDoses: z.string().optional(),
//   vacrec: z.string().optional(),

// });




// Vital signs schema
export const VitalSignSchema = z.object({
  date: z.string().min(1, "Date is required"),
  age: z.string().min(1, "Age is required"),
  ht: z.string().optional(),
  wt: z.string().optional(),
  temp: z.string().optional(),
  notes: z.string().optional(),
  follov_description: z.string().optional(),
  followUpVisit: z.string().optional(),
  followv_status: z.string().optional(),
});

// Main immunization form schema
export const ImmunizationFormSchema = VitalSignSchema.extend({
  vaccines: z.array(
    z.object({
      vacStck_id: z.string().optional(),
      vac_id: z.string().optional(),
      vac_name: z.string().optional(),
      vaccineType: z.string().optional(),
      dose: z.string().optional(),
      date: z.string().optional(),
      expiry_date: z.string().optional(),
      totalDoses: z.string().optional(),
      nextFollowUpDate: z.string().optional(),
      vacrec: z.string().optional(),
      hasExistingVaccination: z.boolean().default(false).optional(),
      existingFollowvId: z.string().optional(), // Optional field for existing follow-up ID

    })
  ).optional(),
  existingVaccines: z.array(
    z.object({
      vac_id: z.string().optional(),
      vac_name: z.string().optional(),
      vaccineType: z.string().optional(),
      dose: z.string().optional(),
      date: z.string().optional(),
      totalDoses: z.string().optional(),
      vacrec: z.string().optional(),
      hasExistingVaccination: z.boolean().default(true).optional(),


    })
  ).optional(),
});

// Optional immunization form schema with all fields optional
export const OptionalImmunizationFormSchema = ImmunizationFormSchema.extend({
  wt: z.string().optional(),
  ht: z.string().optional(),
  temp: z.string().optional(),
  follov_description: z.string().optional(),
  followUpVisit: z.string().optional(),
  followv_status: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  // Custom validation for vaccines array
  if (data.vaccines && data.vaccines.length > 0) {
    data.vaccines.forEach((vaccine, index) => {
      if (!vaccine.vacStck_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vaccine stock ID is required",
          path: [`vaccines.${index}.vacStck_id`],
        });
      }
      if (!vaccine.dose) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dose number is required",
          path: [`vaccines.${index}.dose`],
        });
      }
      if (!vaccine.date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vaccination date is required",
          path: [`vaccines.${index}.date`],
        });
      }
    });
  }

  // Custom validation for existingVaccines array
  if (data.existingVaccines && data.existingVaccines.length > 0) {
    data.existingVaccines.forEach((vaccine, index) => {
      if (!vaccine.vac_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vaccine ID is required",
          path: [`existingVaccines.${index}.vac_id`],
        });
      }
      if (!vaccine.dose) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dose number is required",
          path: [`existingVaccines.${index}.dose`],
        });
      }
      if (!vaccine.date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vaccination date is required",
          path: [`existingVaccines.${index}.date`],
        });
      }
    });
  }
});

// Type definitions
export type VitalSignType = z.infer<typeof VitalSignSchema>;
// export type VaccineRecord = z.infer<typeof vaccineRecordSchema>;
// export type ExistingVaccineRecord = z.infer<typeof existingVaccineRecordSchema>;
export type ImmunizationFormData = z.infer<typeof ImmunizationFormSchema>;
export type OptionalImmunizationFormData = z.infer<typeof OptionalImmunizationFormSchema>;
export type FormData = z.infer<typeof ImmunizationFormSchema>;

export type VaccineRecord = {
  vacStck_id: string;
  vac_id: string;
  vac_name: string;
  vaccineType: string;
  dose: string;
  date: string;
  expiry_date?: string;
  totalDoses?: string;
  nextFollowUpDate?: string;
  vacrec?: string;
  existingFollowvId?: string; // Optional field for existing follow-up ID
};

// Existing Vaccine Record Type
export type ExistingVaccineRecord = {
  vac_id: string;
  vac_name: string;
  vaccineType: string;
  dose: string;
  date: string;
  hasExistingVaccination: boolean;
  totalDoses?: string;
  vacrec?: string;
};

