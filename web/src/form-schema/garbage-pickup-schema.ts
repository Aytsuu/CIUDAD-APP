import z from 'zod'

export const RejectPickupRequestSchema = z.object({
  reason: z.string().min(1, { message: "Reason is required." }),
});

