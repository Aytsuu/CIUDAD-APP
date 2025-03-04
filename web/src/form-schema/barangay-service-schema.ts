import z from "zod"

const BarangayServiceFormSchema = z.object({

    serialNo: z.string().min(1, "Serial No. is required"),
    requestor: z.string().min(1, 'Requestor Name is required'),
    purposes: z.array(z.string()).min(1, 'Please select a purpose'),
})

export default BarangayServiceFormSchema