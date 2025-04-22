import z from "zod";

const HeaderRequirement = z.union([
        z.string()
            .default("")
            .refine((val) => val.trim() !== "", { message: "This field is required" }) 
            .transform((val) => parseFloat(val)) // Convert to float
            .refine((val) => val > -1, { message: "Value must be a positive number" }), 
        z.number()
            .refine((val) => val > -1, { message: "Value must be a positive number" }) 
    ]).transform((val) => String(val)); 

    const AllocationRequirement = z.union([
        z.string()
            .default("")
            .refine((val) => val.trim() !== "", { message: "This field is required" }) 
            .transform((val) => parseFloat(val)) // Convert to float
            .refine((val) => val >= 0, { message: "Value must be a positive number" }) 
            .refine((val) => val <= 100, { message: "Value must not exceed 100" }), 
        z.number()
            .refine((val) => val >= 0, { message: "Value must be a positive number" }) 
            .refine((val) => val <= 100, { message: "Value must not exceed 100" }) 
    ]).transform((val) => String(val));

export const HeaderEditSchema = z.object({
    balanceEdit: HeaderRequirement,
    realtyTaxShareEdit: HeaderRequirement,
    taxAllotmentEdit: HeaderRequirement,
    clearanceAndCertFeesEdit: HeaderRequirement,
    otherSpecificIncomeEdit: HeaderRequirement,
    actualIncomeEdit: HeaderRequirement,
    actualRPTEdit:     HeaderRequirement,   
});


export const AllocationEditSchema = z.object({
    personalServicesLimitEdit: AllocationRequirement,
    miscExpenseLimitEdit: AllocationRequirement,
    localDevLimitEdit: AllocationRequirement,
    skFundLimitEdit: AllocationRequirement,
    calamityFundLimitEdit: AllocationRequirement,
})


export type HeaderEditValues = z.infer<typeof HeaderEditSchema>;
export type AllocationEditValues = z.infer<typeof AllocationEditSchema>;
export type EditHeaderAndAllocationValues = z.infer<typeof EditHeaderAndAllocationSchema>;