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
  dis_fund: AmountRequirement.optional(),
  dis_particulars: z.array(z.object({
    forPayment: z.string().min(1, "Description is required"), 
    tax: AmountRequirement, 
    amount: AmountRequirement,
  })).min(1, "At least one particular is required"), 
  dis_checknum: z.string().optional(),
  dis_bank: z.string().optional(),
  dis_or_num: z.string().optional(),
  dis_paydate: z.string().optional(),
  dis_payacc: z.array(z.object({
    account: z.string().optional(), 
    accCode: z.string().optional(),
    debit: AmountRequirement,
    credit: AmountRequirement,
  })).min(1, "At least one payment account is required"),
  dis_signatories: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    position: z.string().min(1, "Position is required"),
    type: z.enum(["certified_appropriation", "certified_availability", "certified_validity"])
  })).length(3, "All three signatories are required"),
  staff: z.number().optional(),
  files: z.array(z.any()).optional(),
});

export type DisbursementFormValues = z.infer<typeof DisbursementSchema>;