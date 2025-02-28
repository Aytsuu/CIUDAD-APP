import z from "zod"

const IncomeExpenseEditFormSchema = z.object({

    serialNo: z.string().optional(),
    entryType: z.string(z.string()).optional(),
    particulars: z.string().optional(),
    amount: z.string().optional(),
    receiver: z.string().optional(),
    addNotes: z.string().optional(),
})

export default IncomeExpenseEditFormSchema