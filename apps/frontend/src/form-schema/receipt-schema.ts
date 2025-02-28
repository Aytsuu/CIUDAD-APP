import z from "zod"

const ReceiptSchema = z.object({

    serialNo: z.string().min(1, "Serial No. is required"),
})

export default ReceiptSchema