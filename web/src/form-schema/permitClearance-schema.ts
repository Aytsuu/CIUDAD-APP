import z from "zod"

const PermitClearanceFormSchema = z.object({
    businessName: z.string().min(1, 'Business is required.'), // Now stores business ID or business name for Business Clearance
    requestor: z.string().min(1, 'Requestor Name is required.'),
    address: z.string().min(1, 'Address is required.'),
    grossSales: z.string().optional(), // Optional - only required for Barangay Clearance, not for Barangay Permit
    purposes: z.string().min(1, 'Please select a purpose.'), // Now stores purpose ID
    rp_id: z.string().default(''),
    manualGrossSales: z.string().optional() // Manual gross sales input for Business Clearance

});

export default PermitClearanceFormSchema