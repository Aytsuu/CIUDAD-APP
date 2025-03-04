import z from "zod"

const PermitClearanceFormSchema = z.object({

    serialNo: z.string().min(1, "Receipt Serial No. is required"),
    businessName: z.string().min(1, 'Business Name is required.'),
    requestor: z.string().min(1, 'Requestor Name is required.'),
    address: z.string().min(1, 'Address is required.'),
    grossSales: z.string().min(1, 'Gross Sales is required.'),
    purposes: z.array(z.string()).min(1, 'Please select at least 1 purpose.'),

});

export default PermitClearanceFormSchema