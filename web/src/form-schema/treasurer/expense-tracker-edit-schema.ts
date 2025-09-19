import z from "zod"

const IncomeExpenseEditFormSchema = z.object({

    iet_serial_num: z.string().optional(),
    iet_entryType: z.string(z.string()).optional(),
    iet_datetime: z.string().nonempty("Date is required"),
    iet_particulars: z.string().min(1, "Particulars is required"),
    iet_amount: z.string().min(1, "Amount is required"),
    iet_actual_amount: z.string().optional(),
    iet_additional_notes: z.string().optional(),
    // receipt_image: z.string().nonempty('Receipt is required.'),
    // iet_receipt_image: z.string().url("Please upload a valid receipt image"),
    // iet_receipt_image: z.string()   
})

export default IncomeExpenseEditFormSchema