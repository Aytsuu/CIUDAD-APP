import { z } from "zod"

export const positionAssignmentSchema = z.object({
    assignPosition: z.string().min(1)
})