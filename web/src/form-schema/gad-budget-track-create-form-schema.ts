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
  gbud_type: z.enum(["Income", "Expense"], { message: "Type must be 'Income' or 'Expense'" }),
  gbud_datetime: z.string().nonempty("Date is required"),
  gbud_add_notes: z.string().max(500, "Notes must not exceed 500 characters").optional(),
  gbud_inc_particulars: z.string().max(200, "Particulars must not exceed 200 characters").optional(),
  gbud_inc_amt: DataRequirement.optional(),
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
  gbud_reference_num: z.string().max(200, "Reference number must not exceed 200 characters").optional(),
  gbud_remaining_bal: DataRequirement.optional(),
  gbudy: z.number().min(1, "Valid year budget is required"),
  gpr_id: z.number().optional(),
}).superRefine((data, ctx) => {
  // Income validation
  if (data.gbud_type === "Income") {
    if (!data.gbud_inc_particulars) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gbud_inc_particulars"],
        message: "Income particulars required",
      });
    }
    if (data.gbud_inc_amt === undefined || data.gbud_inc_amt === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gbud_inc_amt"],
        message: "Income amount required",
      });
    }
  }
    if (data.gbud_type === "Expense") {
      return (
        !!data.gbud_exp_project &&
        !!data.gbud_exp_particulars &&
        data.gbud_exp_particulars.length > 0 &&
        data.gbud_actual_expense != null &&
        data.gpr_id != null
      );
    }
    return true; // Allow initial state before type is set
  },
);

export type FormValues = z.infer<typeof GADAddEntrySchema>;
export default GADAddEntrySchema;