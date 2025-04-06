import { z } from "zod"

export const positionAssignmentSchema = z.object({
    assignPosition: z.string().min(1)
})

export const positionFormSchema = z.object({
    pos_title: z.string()
        .min(1, 'Title is required.')
        .min(3, 'Title must be atleast 3 letters.'),
    
    pos_max: z.string().min(1, 'Maximum holders is required.')
})