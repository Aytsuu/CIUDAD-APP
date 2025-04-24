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

    iet_serial_num: z.string().optional(),
    iet_entryType: z.string(z.string()).optional(),
    iet_particulars: z.string().min(1, "Particulars is required"),
    iet_amount: z.string().min(1, "Amount is required"),
    iet_additional_notes: z.string().optional(),
    // receipt_image: z.string().nonempty('Receipt is required.'),
    iet_receipt_image: z.instanceof(File).optional(),
})

export default IncomeExpenseEditFormSchema