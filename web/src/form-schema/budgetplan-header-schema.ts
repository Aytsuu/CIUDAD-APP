import z from "zod"

const BudgetHeaderSchema = z.object({
    availableResources: z.string().nonempty("NET Available Resources is required").default("0.00"),
    actualIncome: z.string().nonempty("Actual Income is required").default("0.00"),
    actualRPT: z.string().nonempty("Actual RPT Income is required").default("0.00")
})

export default BudgetHeaderSchema