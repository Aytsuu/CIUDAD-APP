import z from "zod";

const DataRequirement = z.union([
    z.string()
        .default("")
        .refine((val) => val.trim() !== "", { message: "This field is required" }) // Check for empty values
        .transform((val) => parseFloat(val)) // Convert to float
        .refine((val) => val >= 0, { message: "Value must be a positive number" }) // Ensure positive value
        .refine((val) => val <= 100, { message: "Value must not exceed 100" }), // Ensure value does not exceed 100
    z.number()
        .refine((val) => val >= 0, { message: "Value must be a positive number" }) // Ensure positive value
        .refine((val) => val <= 100, { message: "Value must not exceed 100" }) // Ensure value does not exceed 100
]).transform((val) => String(val));

const BudgetAllocationSchema = z.object({
    personalServicesLimit: DataRequirement,
    miscExpenseLimit: DataRequirement,
    localDevLimit: DataRequirement,
    skFundLimit: DataRequirement,
    calamityFundLimit: DataRequirement,
})

export default BudgetAllocationSchema