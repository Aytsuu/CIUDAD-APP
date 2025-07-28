import z from "zod"

export const BudgetItemEditSchema = z.object({
  to: z.string().nonempty("This field is required."),
  amount: z.string().min(1, "This field is required"),
  from: z.string().nonempty("This field is required.")
})