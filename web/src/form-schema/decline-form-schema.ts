import z from 'zod'

export const DeclineReqSchema = z.object({
  reason: z.string().min(1, { message: "Reason is required." }),
  id: z.string().default('')
});