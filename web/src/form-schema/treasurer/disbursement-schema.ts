import { z } from "zod";

const AmountRequirement = z.union([
  z.string()
    .default("")
    .refine((val) => val.trim() !== "", { message: "This field is required" })
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, { message: "Amount must be a positive number" }),
  z.number()
    .refine((val) => val >= 0, { message: "Amount must be a positive number" })
]).transform((val) => Number(val));

export const DisbursementSchema = z.object({
  dis_payee: z.string().min(1, "Payee is required"),
  dis_tin: z.string().optional(),
  dis_date: z.string().min(1, "Date is required"),
  dis_fund: AmountRequirement,
  dis_particulars: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    amount: AmountRequirement,
  })).min(1, "At least one particular is required"),
  dis_docs: z.array(z.object({
    doc_name: z.string().min(1, "Document name is required"),
    doc_type: z.string().min(1, "Document type is required"),
  })).optional().default([]),
  dis_checknum: z.string().optional(),
  dis_bank: z.string().optional(),
  dis_or_num: z.string().optional(),
  dis_paydate: z.string().min(1, "Payment date is required"),
  dis_payacc: z.array(z.object({
    account_code: z.string().min(1, "Account code is required"),
    account_title: z.string().min(1, "Account title is required"),
    debit: AmountRequirement.optional(),
    credit: AmountRequirement.optional(),
  })).optional().default([]),
  staff: z.number().optional(),
  files: z.array(z.any()).optional(),
});

export type DisbursementFormValues = z.infer<typeof DisbursementSchema>;