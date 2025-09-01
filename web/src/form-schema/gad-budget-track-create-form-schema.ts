// form-schema/gad-budget-track-create-form-schema.ts
import { z } from "zod";

const DataRequirement = z.union([
  z
    .string()
    .nonempty({ message: "This field is required" })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), { message: "Value must be a valid number" })
    .refine((val) => val >= 0, { message: "Value must be non-negative" })
    .refine((val) => val.toString().replace(".", "").length <= 8, {
      message: "Value must not exceed 8 digits before decimal",
    })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "Value must have up to 2 decimal places",
    }),
  z
    .number()
    .min(0, { message: "Value must be non-negative" })
    .refine((val) => val.toString().replace(".", "").length <= 8, {
      message: "Value must not exceed 8 digits before decimal",
    })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), {
      message: "Value must have up to 2 decimal places",
    }),
]);

const GADAddEntrySchema = z.object({
  gbud_datetime: z.string().nonempty("Date is required"),
  gbud_add_notes: z.string().max(500, "Notes must not exceed 500 characters").optional(),
  gbud_exp_project: z.string().max(200, "Project title must not exceed 200 characters").optional(),
  gbud_exp_particulars: z.array(
    z.object({
      name: z.string().nonempty("Budget item name is required"),
      pax: z.string().nonempty("Pax is required"),
      amount: z.union([
        z.number().min(0, "Amount must be non-negative"),
        z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val), "Amount must be a valid number"),
      ]).transform((val) => Number(val)),
    })
  ).optional(),
  gbud_actual_expense: DataRequirement.optional(),
  gbud_reference_num: z.string().max(200, "Reference number must not exceed 200 characters").optional().nullable(),
  gbud_remaining_bal: DataRequirement.optional(),
  gbud_proposed_budget: DataRequirement.optional(),
  gbudy: z.number().min(1, "Valid year budget is required"),
  gpr: z.number().optional().nullable(),
  staff: z.string().optional().nullable(),
})

export type FormValues = z.infer<typeof GADAddEntrySchema>;
export default GADAddEntrySchema;