import z from "zod"

const IncomeEditFormSchema = z.object({

    inc_entryType: z.string().optional(),
    inc_serial_num: z.string().optional(),
    inc_particulars: z.string().nonempty('Particulars is required'),
    inc_amount: z.string().nonempty('Amount is required'),
    inc_additional_notes: z.string().optional(),
    inc_receipt_image: z.any()
    .refine((file) => {
        if (!file) return false;
        
        if (file instanceof File) {
            return file.size > 0;
        }
        
        if (file?.file instanceof File) {
            return file.file.size > 0;
        }
        
        if (typeof file === 'string') {
            // If it's already a URL string from server
            return true;
        }
        
        return false;
    }, {
        message: "Please upload a valid receipt image"
    })
})

export default IncomeEditFormSchema