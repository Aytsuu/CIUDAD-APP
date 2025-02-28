import { z } from 'zod';

// Define the schema for the Waste Hotspot form
const GADAddEntrySchema = z.object({
    entryType: z.string(z.string()).nonempty("Type is required"),
    entryAmount: z.string().nonempty("Amount is required"),
    entryParticulars: z.string().nonempty("Particulars is required"),
    additionalNotes: z.string(z.string()).optional(),
});

// Export the schema
export default GADAddEntrySchema;