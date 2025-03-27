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


export const ClearanceForPermitRatesSchema = z.object({
    maxRange: DataRequirement,
    minRange: DataRequirement,
    amount: DataRequirement,
})

export const PersonalClearanceSchema = z.object({
    purpose: z.string().nonempty('This field is required').default(""),
    amount: DataRequirement,
})

export const ServiceChargesSchema = z.object({
    purpose: z.string().nonempty('This field is required').default(''),
    amount: DataRequirement,
})

export const PermitClearanceSchema = z.object({
    purpose: z.string().nonempty('This field is required').default(''),
    amount: DataRequirement,
})
export const BarangayFeesAndChargesSchema = z.object({
    purpose: z.string().nonempty('This field is required').default(''),
    amount: DataRequirement,
})


export const RatesFormSchema = ClearanceForPermitRatesSchema.merge(PersonalClearanceSchema)
                                                            .merge(ServiceChargesSchema)
                                                            .merge(PermitClearanceSchema)
                                                            .merge(BarangayFeesAndChargesSchema)

export type FormData = z.infer<typeof RatesFormSchema>