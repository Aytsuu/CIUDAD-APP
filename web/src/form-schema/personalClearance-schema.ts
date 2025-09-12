import z from "zod"

export const NonResidentFormSchema = z.object({
    requester: z.string().min(1, "Requester name is required"),
    purpose: z.string().min(1, "Please select a purpose"),
    address: z.string().min(1, "Address is required."),
    birthdate: z.string().min(1, "Birthdate is required.")
})

export const ResidentFormSchema = z.object({
    requester: z.string().min(1, "Requester name is required"),
    purpose: z.string().min(1, "Please select a purpose"),
    rp_id: z.string().optional()
})
