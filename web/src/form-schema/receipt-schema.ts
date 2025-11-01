import z from "zod"

const DataRequirement = z.union([
    z.string()
        .default("")
        .refine((val) => val.trim() !== "", { message: "This field is required" })
        .transform((val) => parseFloat(val)) // Convert to float
        .refine((val) => val > -1, { message: "Value must be a positive number" }),
    z.number()
        .refine((val) => val > -1, { message: "Value must be a positive number" })
]).transform((val) => val === 0 ? "" : String(val));

// Function to create schema with rate validation
export const createReceiptSchema = (requiredRate?: string, isFreeService: boolean = false) => {
    return z.object({
        inv_serial_num: z.string().nonempty('This field is required'),
        // For free services, allow "0" or "N/A", otherwise use DataRequirement
        inv_amount: isFreeService
            ? z.union([
                z.string().transform((val) => {
                    // Allow "0", "N/A", or empty string for free services
                    if (val === "0" || val === "N/A" || val.trim() === "") return "0";
                    return val;
                }),
                z.number().transform(() => "0")
            ])
            : DataRequirement,
        inv_nat_of_collection: z.string().default(''),
        id: z.string().optional(),
        bpr_id: z.union([z.string(), z.number()]).optional().nullable()
            .transform((v) => (v === '' || v === undefined ? undefined : v)),
        nrc_id: z.union([z.string(), z.number()]).optional().nullable()
            .transform((v) => (v === '' || v === undefined ? undefined : v)),
        cr_id: z.string().optional().nullable()
            .transform((v) => (v === '' || v === undefined ? undefined : v)),
    }).refine((data) => {
        // Skip rate validation for free services
        if (isFreeService || !requiredRate) return true
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
    id: z.string().optional(),
    bpr_id: z.union([z.string(), z.number()]).optional().nullable()
        .transform((v) => (v === '' || v === undefined ? undefined : v)),
    nrc_id: z.union([z.string(), z.number()]).optional().nullable()
        .transform((v) => (v === '' || v === undefined ? undefined : v)),
    cr_id: z.string().optional().nullable()
        .transform((v) => (v === '' || v === undefined ? undefined : v)),
});

export default ReceiptSchema