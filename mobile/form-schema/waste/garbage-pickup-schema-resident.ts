import z from "zod"

export const garbagePickupRequestCreateSchema = z.object({
    sitio_id: z.string().nonempty('This field is required'),
    garb_location: z.string().nonempty('This field is required').default(''),
    garb_waste_type: z.string().nonempty('This field is required').default(''),
    garb_pref_date: z.string().nonempty('This field is required').default(''),
    garb_pref_time: z.string().nonempty('This field is required').default(''),   
    garb_additional_notes: z.string().default(''),
})