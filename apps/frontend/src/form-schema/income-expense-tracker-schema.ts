import z from "zod"

const IncomeExpenseFormSchema = z.object({

    serialNo: z.string().nonempty("Serial No. is required"),
    entryType: z.string(z.string()).nonempty('Please select an entry type'),
    particulars: z.string().nonempty('Particulars is required'),
    amount: z.string().nonempty('Amount is required'),
    receiver: z.string().nonempty('Receiver Name is required'),
    addNotes: z.string().optional(),
})

export default IncomeExpenseFormSchema