import z from "zod"

const PermitClearanceFormSchema = z.object({
    businessName: z.string().min(1, 'Business is required.'), // Now stores business ID
    requestor: z.string().min(1, 'Requestor Name is required.'),
    address: z.string().min(1, 'Address is required.'),
    grossSales: z.string().min(1, 'Gross Sales is required.'),
    purposes: z.string().min(1, 'Please select a purpose.'), // Now stores purpose ID
    rp_id: z.string().default('')

});

export default PermitClearanceFormSchema