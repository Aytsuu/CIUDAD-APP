
import z from "zod"


const DataRequirement = z.union([
    z.string()
        .default("")
        .refine((val) => val.trim() !== "", { message: "This field is required" })
        .transform((val) => parseFloat(val)) // Convert to float
        .refine((val) => val > -1, { message: "Value must be a positive number" }),
    z.number()
        .refine((val) => val > -1, { message: "Value must be a positive number" })
]).transform((val) => String(val));


export const AnnualGrossSalesEditSchema = z.object({
    maxRange: DataRequirement,
    minRange: DataRequirement,
    amount: DataRequirement,
    ags_id: z.string().default('')
})

export const PurposeAndRatesEditSchema = z.object({
    purpose: z.string().nonempty('This field is required').default(''),
    amount: DataRequirement,
    category: z.string().nonempty('This field is required').default(''),
    pr_id: z.string().default('')
})
