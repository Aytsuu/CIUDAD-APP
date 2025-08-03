import { z } from 'zod';

const DataRequirement = z.union([
  z.string()
    .default("")
    .refine((val) => val.trim() !== "", { message: "This field is required" })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val), { message: "Value must be a valid number" })
    .refine((val) => val >= 0, { message: "Value must be non-negative" })
    .refine((val) => val.toString().replace('.', '').length <= 8, { message: "Value must not exceed 8 digits before decimal" })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), { message: "Value must have up to 2 decimal places" }),
  z.number()
    .refine((val) => !isNaN(val), { message: "Value must be a valid number" })
    .refine((val) => val >= 0, { message: "Value must be non-negative" })
    .refine((val) => val.toString().replace('.', '').length <= 8, { message: "Value must not exceed 8 digits before decimal" })
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val.toString()), { message: "Value must have up to 2 decimal places" })
]);

const GADAddEntrySchema = z.object({
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
})
.refine(
  (data) => {
    if (data.gbud_type === "Income") {
      return (
        !!data.gbud_inc_particulars &&
        data.gbud_inc_amt != null
      );
    }
    if (data.gbud_type === "Expense") {
      return (
        !!data.gbud_exp_particulars
      );
    }
    return false;
  }
)
  .refine(
  (data) => {
    if (data.gbud_type !== "Expense") return true;
    
    // We'll add the remaining balance check in the component
    // since we need access to the current budget data
    return true;
  },
  {
    message: "Required fields missing for the selected entry type",
    path: ["gbud_type"],
  }
)

export type FormValues = z.infer<typeof GADAddEntrySchema>;
export default GADAddEntrySchema;