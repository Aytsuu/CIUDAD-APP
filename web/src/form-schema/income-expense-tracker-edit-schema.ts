// import z from "zod"

// const IncomeExpenseEditFormSchema = z.object({

//     serialNo: z.string().optional(),
//     entryType: z.string(z.string()).optional(),
//     particulars: z.string().optional(),
//     amount: z.string().optional(),
//     receiver: z.string().optional(),
//     addNotes: z.string().optional(),
// })

// export default IncomeExpenseEditFormSchema



import z from "zod"

const IncomeExpenseEditFormSchema = z.object({

    serialNo: z.string().optional(),
    entryType: z.string(z.string()).optional(),
    particulars: z.string().optional(),
    amount: z.string().optional(),
    receiver: z.string().optional(),
    addNotes: z.string().optional(),
    // receipt_image: z.string().nonempty('Receipt is required.'),
    receipt_image: z.instanceof(File).optional(),
})

export default IncomeExpenseEditFormSchema