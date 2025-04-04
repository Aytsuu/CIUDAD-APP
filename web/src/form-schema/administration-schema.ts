import { z } from "zod"

export const positionAssignmentSchema = z.object({
    assignPosition: z.string().min(1)
})

export const positionFormSchema = z.object({
    title: z.string()
        .min(1, 'Title is required.')
        .min(3, 'Title must be atleast 3 letters.'),
    
    maximum: z.string().min(1, 'Maximum holders is required.')
})