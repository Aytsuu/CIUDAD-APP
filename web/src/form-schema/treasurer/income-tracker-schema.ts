import z from "zod"

const IncomeFormSchema = z.object({

    inc_entryType: z.string().optional(),
    inc_particulars: z.string().nonempty('Particulars is required'),
    inc_amount: z.string().nonempty('Amount is required'),
    inc_additional_notes: z.string().optional(),
    inc_receipt_image: z.string().url("Please upload a valid receipt image"),
})

export default IncomeFormSchema