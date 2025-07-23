import z from "zod"

const IncomeEditFormSchema = z.object({

    inc_entryType: z.string().optional(),
    inc_datetime: z.string().nonempty('Date is required'),
    inc_serial_num: z.string().optional(),
    inc_transac_num: z.string().optional(),
    inc_particulars: z.string().nonempty('Particulars is required'),
    inc_amount: z.string().nonempty('Amount is required'),
    inc_additional_notes: z.string().optional(),
    // inc_receipt_image: z.string().url("Please upload a valid receipt image"),
})

export default IncomeEditFormSchema