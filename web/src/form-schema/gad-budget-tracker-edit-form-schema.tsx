import { z } from 'zod';

// Define the schema for the Waste Hotspot form
const GADEditEntrySchema = z.object({
    entryType: z.string(z.string()).optional(),
    entryAmount: z.string().optional(),
    entryParticulars: z.string().optional(),
    additionalNotes: z.string(z.string()).optional(),
});

// Export the schema
export default GADEditEntrySchema;