import z from "zod"

export const BudgetPlanSuppDocSchema = z.object({
  description: z.string().min(1, "Description is required"),
});


