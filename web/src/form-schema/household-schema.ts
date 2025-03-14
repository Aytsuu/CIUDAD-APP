import { z } from "zod";

export const householdSchema = z.object({
    generatedHouseNo: z.string(),
    existingHouseNo: z.string(),
    householdHead: z.string()
})
