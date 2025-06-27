// form-schema/gad-budget-tracker-schema.ts
import { z } from 'zod';

const DataRequirement = z.union([
  z.string()
    .transform(val => val.trim() === "" ? null : val) // Convert empty string to null
    .nullable()
    .refine(val => val === null || !isNaN(parseFloat(val)), { 
      message: "Value must be a valid number" 
    })
    .transform(val => val === null ? null : parseFloat(val))
    .refine(val => val === null || val >= 0, { 
      message: "Value must be non-negative" 
    })
    .refine(val => val === null || val.toString().replace('.', '').length <= 8, { 
      message: "Value must not exceed 8 digits before decimal" 
    })
    .transform(val => val === null ? null : Number(val.toFixed(2))),
  z.number()
    .refine(val => !isNaN(val), { message: "Value must be a valid number" })
    .refine(val => val >= 0, { message: "Value must be non-negative" })
    .refine(val => val.toString().replace('.', '').length <= 8, { 
      message: "Value must not exceed 8 digits before decimal" 
    })
    .transform(val => Number(val.toFixed(2)))
]).nullable();

const BudgetTrackerSchema = z.object({
  gbud_type: z.enum(["Income", "Expense"], { message: "Type must be 'income' or 'expense'" }),
  gbud_datetime: z.string().nonempty("Date is required"),
  gbud_add_notes: z.string().max(500, "Notes must not exceed 500 characters").optional().nullable(),
  gbud_inc_particulars: z.string().max(200, "Particulars must not exceed 200 characters").optional().nullable(),
  gbud_inc_amt: DataRequirement.optional().nullable(),
  gbud_exp_particulars: z.string().max(200, "Particulars must not exceed 200 characters").optional().nullable(),
  gbud_proposed_budget: DataRequirement.optional().nullable(),
  gbud_actual_expense: DataRequirement.optional().nullable(),
  gbud_reference_num: z.string().max(200, "Reference number must not exceed 200 characters").optional().nullable(),
  gbud_remaining_bal: DataRequirement.optional().nullable(),
  gbudy: z.number().min(1, "Valid year budget is required"),
  gdb_id: z.number().optional().nullable(),
  gbud_files: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      path: z.string(),
      uri: z.string(),
    })
  ).optional(),
}).refine(
  (data) => {
    if (data.gbud_type === "Income") {
      return (
        !!data.gbud_inc_particulars &&
        data.gbud_inc_amt != null
      );
    }
    if (data.gbud_type === "Expense") {
      return (
        !!data.gbud_exp_particulars &&
        (data.gbud_actual_expense != null || data.gbud_proposed_budget != null)
      );
    }
    return false;
  },
  {
    message: "Particulars and either proposed budget or actual expense are required for expenses",
    path: ["gbud_type"],
  }
);

export type FormValues = z.infer<typeof BudgetTrackerSchema>;
export default BudgetTrackerSchema;

export const GADEditEntrySchema = z.object({
  gbud_datetime: z.string(),
  gbud_type: z.enum(['Income', 'Expense']),
  gbud_add_notes: z.string().nullish(),
  gbud_inc_particulars: z.string().nullish(),
  gbud_inc_amt: z.string().nullish(),
  gbud_exp_particulars: z.string().nullish(),
  gbud_proposed_budget: z.string().nullish(),
  gbud_actual_expense: z.string().nullish(),
  gbud_reference_num: z.string().nullish(),
  gbud_remaining_bal: z.number().nullish(),
  gbudy: z.number(),
  gdb: z.number().nullish(),
  gbud_files: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      path: z.string(),
      uri: z.string(),
    })
  ).optional(),
});

export type EditFormValues = z.infer<typeof GADEditEntrySchema>;