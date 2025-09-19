import z from "zod"

const IncomeExpenseFormSchema = z.object({

    iet_serial_num: z.string().nonempty('Serial number is required'),
    iet_entryType: z.string().optional(),
    // iet_date: z.string().nonempty("Date is required"),
    // iet_time: z.string().nonempty("Time is required"),
    iet_datetime: z.string().nonempty("Date & Time is required"),
    iet_particulars: z.string().nonempty('Particulars is required'),
    iet_amount: z.string().nonempty('Amount is required'),
    iet_actual_amount: z.string().optional(),
    iet_additional_notes: z.string().optional(),

    // iet_receipt_image: z.array(z.object({
    //     name: z.string(),
    //     type: z.string(),
    //     path: z.string(),
    //     url: z.string(),
    // })).optional(),

})

export default IncomeExpenseFormSchema