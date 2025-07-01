import { z } from "zod";
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

export const GADEditEntrySchema = z.object({
  gbud_type: z.enum(["Income", "Expense"]),
  gbud_datetime: z.string().nonempty("Date is required"),
  gbud_add_notes: z.string().nullable(),
  gbud_inc_particulars: z.string().nullable(),
  gbud_inc_amt: DataRequirement.optional().nullable(),
  gbud_exp_particulars: z.string().nullable(),
  gbud_proposed_budget: DataRequirement.optional().nullable(),
  gbud_actual_expense: DataRequirement.optional().nullable(),
  gbud_reference_num: z.string().nullable(),
  gbud_remaining_bal: DataRequirement.optional().nullable(),
  gbudy: z.number().min(1, "Budget year is required"),
  gdb_id: z.number().nullable(),
});

export type FormValues = z.infer<typeof GADEditEntrySchema>;