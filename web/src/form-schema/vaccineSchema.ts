// import { z } from "zod";

// // Schema for vital signs
// export const VitalSignsSchema = z.object({
//   pr: z.string().optional(),
//   temp: z.string().optional(),
//   o2: z.string().optional(),
//   bpsystolic: z.string().optional(),
//   bpdiastolic: z.string().optional(),

// }); 

// // Schema for vaccine details
// export const VaccineSchema = z.object({ 
//   pat_id :z.string().min(1, "Patient ID is required"),
//   vaccinetype: z.string().min(1, "Vaccine is required"),
//   datevaccinated: z.string().min(1, "Date is required"),
//   age: z.string().min(1, "Age is required"),
//   assignto: z.string().min(1, "choose a person  to do the vitalsigns"),


// });

// // Merge schemas
// export const CombinedSchema = VaccineSchema.merge(VitalSignsSchema);

// // Define TypeScript types from schemas
// export type VaccineSchemaType = z.infer<typeof VaccineSchema>;
// export type VitalSignsType = z.infer<typeof VitalSignsSchema>; 
// export type CombineVaccineType = z.infer<typeof CombinedSchema>;

// export default CombinedSchema;





// form-schema/vaccineSchema.ts
import { z } from "zod";

export const VaccineSchema = z
  .object({
    pat_id: z.string().min(1, "Patient ID is required"),
    vaccinetype: z.string().min(1, "Vaccine type is required"),
    datevaccinated: z.string().min(1, "Date vaccinated is required"),
    assignto: z.string().optional(),
    age: z.string().optional(),
    followv_date: z.string().optional(),
    vachist_doseNo: z.number().optional(),
    vacrec_totaldose: z.string().optional(),

  })
  

export const VitalSignsSchema = z.object({
staff_id: z.string().optional(),
  patrec_id: z.string().optional(),
  pr: z.string().optional(),
  temp: z.string().optional(),
  o2: z.string().optional(),
  bpsystolic: z.string().optional(),
  bpdiastolic: z.string().optional(),
});

export type VaccineSchemaType = z.infer<typeof VaccineSchema>;
export type VitalSignsType = z.infer<typeof VitalSignsSchema>;