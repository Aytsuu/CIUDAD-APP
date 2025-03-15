import { z } from "zod";

export const householdSchema = z.object({
    generatedHouseNo: z.string(),
    existingHouseNo: z.string(),
    streetAddress: z.string(),
    householdHead: z.string()
})
