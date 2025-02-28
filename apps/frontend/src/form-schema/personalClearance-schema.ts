import z from "zod"

const PersonalClearanceFormSchema = z.object({

    serialNo: z.string().min(1, "Serial number is required"),
    requester: z.string().min(1, "Requester name is required"),
    purposes: z.array(z.string()).min(1, "Please select at least one purpose"), 
})

export default PersonalClearanceFormSchema