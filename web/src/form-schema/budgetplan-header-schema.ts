import z from "zod"

const DataRequirement = z.union([
        z.string()
            .default("")
            .refine((val) => val.trim() !== "", { message: "This field is required" }) // Check for empty values
            .transform((val) => parseFloat(val)) // Convert to float
            .refine((val) => val > -1, { message: "Value must be a positive number" }), // Ensure positive value
        z.number()
            .refine((val) => val > -1, { message: "Value must be a positive number" }) // Ensure positive value
    ]).transform((val) => String(val)); 

const BudgetHeaderSchema = z.object({
    balance: DataRequirement,
    realtyTaxShare: DataRequirement,
    taxAllotment: DataRequirement,
    clearanceAndCertFees: DataRequirement,
    otherSpecificIncome: DataRequirement,
    actualIncome: DataRequirement,
    actualRPT: DataRequirement,

})

export default BudgetHeaderSchema