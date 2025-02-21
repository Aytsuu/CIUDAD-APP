import z from "zod"

const IncomeExpenseFormSchema = z.object({

    serialNo: z.string().min(1, "Serial No. is required"),
    entryType: z.string().min(1, 'Please select an entry type'),
    particulars: z.string().min(1, 'Particulars is required'),
    amount: z.string().min(1, 'Amount is required'),
    receiver: z.string().min(1, 'Receiver Name is required'),
    addNotes: z.string()
})

export default IncomeExpenseFormSchema