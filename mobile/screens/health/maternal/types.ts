import z from 'zod'

export const PrenatalAppointmentSchema = z.object({
    userId: z.string(),
    patId: z.string(),
    requestDate: z.string().date(),
    confirmedAt: z.string().date().nullable(),
});