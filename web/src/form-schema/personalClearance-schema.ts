import z from "zod"

export const NonResidentFormSchema = z.object({
    last_name: z.string().min(1, "Last name is required"),
    first_name: z.string().min(1, "First name is required"),
    middle_name: z.string().optional().default(''), // Optional field, defaults to empty string if not provided
    purpose: z.string().min(1, "Please select a purpose"),
    address: z.string().min(1, "Address is required."),
    birthdate: z.string().min(1, "Birthdate is required.")
})

export const ResidentFormSchema = z.object({
    requester: z.string().min(1, "Requester name is required"),
    purpose: z.string().min(1, "Please select a purpose"),
    rp_id: z.string().min(1, "Please select a resident")
})
