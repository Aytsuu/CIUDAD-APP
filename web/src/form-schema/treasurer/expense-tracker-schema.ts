// import z from "zod"

// const IncomeExpenseFormSchema = z.object({

//     serialNo: z.string().nonempty("Serial No. is required"),
//     entryType: z.string(z.string()).nonempty('Please select an entry type'),
//     particulars: z.string().nonempty('Particulars is required'),
//     amount: z.string().nonempty('Amount is required'),
//     receiver: z.string().nonempty('Receiver Name is required'),
//     addNotes: z.string().optional(),
// })

// export default IncomeExpenseFormSchema




// import z from "zod"

// const IncomeExpenseFormSchema = z.object({

//     serialNo: z.string().nonempty("Serial No. is required"),
//     entryType: z.string(z.string()).nonempty('Please select an entry type'),
//     particulars: z.string().nonempty('Particulars is required'),
//     amount: z.string().nonempty('Amount is required'),
//     receiver: z.string().nonempty('Receiver Name is required'),
//     addNotes: z.string().optional(),
//     // receipt_image: z.string().nonempty('Receipt is required.'),
//     receipt_image: z.instanceof(File).refine((file) => file.size > 0, {
//         message: "Receipt is required.",
//     }), // Make this required
// })

// export default IncomeExpenseFormSchema






// import z from "zod"

// const IncomeExpenseFormSchema = z.object({

//     iet_entryType: z.string(z.string()).nonempty('Please select an entry type'),
//     iet_particulars: z.string().nonempty('Particulars is required'),
//     iet_amount: z.string().nonempty('Amount is required'),
//     iet_additional_notes: z.string().optional(),
//     // receipt_image: z.string().nonempty('Receipt is required.'),
//     // iet_receipt_image: z.instanceof(File).refine((file) => file.size > 0, {
//     //     message: "Receipt is required.",
//     // }), 
//     iet_receipt_image: z.any()
//     .refine((file) => {
//         if (!file) return false;
        
//         if (file instanceof File) {
//             return file.size > 0;
//         }
        
//         if (file?.file instanceof File) {
//             return file.file.size > 0;
//         }
        
//         if (typeof file === 'string') {
//             // If it's already a URL string from server
//             return true;
//         }
        
//         return false;
//     }, {
//         message: "Please upload a valid receipt image"
//     })
// })

// export default IncomeExpenseFormSchema



import z from "zod"

const IncomeExpenseFormSchema = z.object({

    iet_serial_num: z.string().nonempty('Serial number is required'),
    iet_entryType: z.string().optional(),
    iet_datetime: z.string().nonempty("Date is required"),
    iet_particulars: z.string().nonempty('Particulars is required'),
    iet_amount: z.string().nonempty('Amount is required'),
    iet_actual_amount: z.string().optional(),
    iet_additional_notes: z.string().optional(),
    // receipt_image: z.string().nonempty('Receipt is required.'),
    // iet_receipt_image: z.instanceof(File).refine((file) => file.size > 0, {
    //     message: "Receipt is required.",
    // }), 
    iet_receipt_image: z.array(z.object({
        name: z.string(),
        type: z.string(),
        path: z.string(),
        url: z.string(),
    })).optional(),
})

export default IncomeExpenseFormSchema