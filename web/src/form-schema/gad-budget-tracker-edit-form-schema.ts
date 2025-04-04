import { z } from 'zod';

// Define the schema for the Waste Hotspot form
const GADEditEntrySchema = z.object({
    gbud_type: z.string(z.string()).nonempty("Type is required"),
    gbud_amount: z.coerce.number().min(0),
    gbud_particulars: z.string().nonempty("Particulars is required"),
    gbud_add_notes: z.string(z.string()).optional(),
});

// Export the schema
export default GADEditEntrySchema;