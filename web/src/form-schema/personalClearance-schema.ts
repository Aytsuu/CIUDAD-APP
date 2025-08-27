import z from "zod"

const PersonalClearanceFormSchema = z.object({
    serialNo: z.string().min(1, "Serial number is required"),
    requester: z.string().min(1, "Requester name is required"),
    purpose: z.string().min(1, "Please select a purpose"),
    rp_id: z.string().optional()
})

export default PersonalClearanceFormSchema