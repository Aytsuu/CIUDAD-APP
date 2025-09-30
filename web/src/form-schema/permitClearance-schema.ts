import z from "zod"

const PermitClearanceFormSchema = z.object({

    serialNo: z.string().min(1, "Receipt Serial No. is required"),
    businessName: z.string().min(1, 'Business Name is required.'),
    businessId: z.string().min(1, 'Business ID is required.'),
    businessGrossSales: z.string().default(''),
    requestor: z.string().min(1, 'Requestor Name is required.'),
    address: z.string().min(1, 'Address is required.'),
    grossSales: z.string().min(1, 'Gross Sales is required.'),
    purposes: z.string().min(1, 'Please select a purpose.'),
    purposeId: z.string().min(1, 'Purpose ID is required.'),
    rp_id: z.string().default('')

});

export default PermitClearanceFormSchema