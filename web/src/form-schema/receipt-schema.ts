import z from "zod"

const DataRequirement = z.union([
    z.string()
        .default("")
        .refine((val) => val.trim() !== "", { message: "This field is required" })
        .transform((val) => parseFloat(val)) // Convert to float
        .refine((val) => val > -1, { message: "Value must be a positive number" }),
    z.number()
        .refine((val) => val > -1, { message: "Value must be a positive number" })
]).transform((val) => String(val));

// Function to create schema with rate validation
export const createReceiptSchema = (requiredRate?: string) => {
    return z.object({
        inv_serial_num: z.string().nonempty('This field is required'),
        inv_amount: DataRequirement,
        inv_nat_of_collection: z.string().default(''),
        id: z.string().optional().default(''), 
        bpr_id: z.string().optional().default('') 
    }).refine((data) => {
        if (!requiredRate) return true
        const amount = parseFloat(data.inv_amount);
        const rate = parseFloat(requiredRate);

        if (isNaN(amount) || isNaN(rate)) return true;

        return amount >= rate;
    }, {
        message: `Amount paid must be at least ₱${requiredRate}`,
        path: ["inv_amount"]
    });
};


const ReceiptSchema = z.object({
    inv_serial_num: z.string().nonempty('This field is required'),
    inv_amount: DataRequirement,
    inv_nat_of_collection: z.string().default(''),
    id: z.string().optional().default(''), // Make optional for business clearance
    bpr_id: z.string().optional().default('') // Add business permit request ID
});

export default ReceiptSchema