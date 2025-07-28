// import z from "zod"

// const DataRequirement = z.union([
//         z.string()
//             .default("")
//             .refine((val) => val.trim() !== "", { message: "This field is required" }) // Check for empty values
//             .transform((val) => parseFloat(val)) // Convert to float
//             .refine((val) => val > -1, { message: "Value must be a positive number" }), // Ensure positive value
//         z.number()
//             .refine((val) => val > -1, { message: "Value must be a positive number" }) // Ensure positive value
//     ]).transform((val) => String(val)); 

// const BudgetHeaderSchema = z.object({
//     balance: DataRequirement,
//     realtyTaxShare: DataRequirement,
//     taxAllotment: DataRequirement,
//     clearanceAndCertFees: DataRequirement,
//     otherSpecificIncome: DataRequirement,
//     actualIncome: DataRequirement,
//     actualRPT: DataRequirement,

// })

// export default BudgetHeaderSchema

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

export const BudgetPlanStep1Schema = z.object({
    balance: DataRequirement,
    realtyTaxShare: DataRequirement,
    taxAllotment: DataRequirement,
    clearanceAndCertFees: DataRequirement,
    otherSpecificIncome: DataRequirement,
    actualIncome: DataRequirement,
    actualRPT: DataRequirement,
    planId: z.number().default(0),
    budgetaryObligations: z.string().default('')
})

export const BudgetPlanStep2Schema = z.object({
    honorariaOfficials: DataRequirement,
    cashOfficials: DataRequirement,
    midBonusOfficials: DataRequirement,
    endBonusOfficials: DataRequirement,
    honorariaTanods: DataRequirement,
    honorariaLupon: DataRequirement,
    honorariaBarangay: DataRequirement,
    prodEnhancement: DataRequirement,
    leaveCredits: DataRequirement,

    memDues: DataRequirement,
    miscExpense: DataRequirement,

    cleanAndGreen: DataRequirement,
    streetLighting: DataRequirement,
    rehabMultPurpose: DataRequirement,

    skFund: DataRequirement,

    qrfFund: DataRequirement,
    disasterTraining: DataRequirement,
    disasterSupplies: DataRequirement,
});

export const BudgetPlanStep3Schema = z.object({
    travelingExpenses: DataRequirement,
    trainingExpenses: DataRequirement,
    officeExpenses: DataRequirement,
    accountableExpenses: DataRequirement,
    medExpenses: DataRequirement,
    waterExpenses: DataRequirement,
    electricityExpenses: DataRequirement,
    telephoneExpenses: DataRequirement,
    officeMaintenance: DataRequirement,
    vehicleMaintenance: DataRequirement,
    fidelityBond: DataRequirement,
    insuranceExpense: DataRequirement,
    gadProg: DataRequirement,
    seniorProg: DataRequirement,
    juvJustice: DataRequirement,
    badacProg: DataRequirement,
    nutritionProg: DataRequirement,
    aidsProg: DataRequirement,
    assemblyExpenses: DataRequirement,
    disasterProg: DataRequirement,
    capitalOutlays: DataRequirement,
})

