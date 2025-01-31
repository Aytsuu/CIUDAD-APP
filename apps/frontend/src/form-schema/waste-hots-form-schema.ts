import { z } from 'zod';

// Define the schema for the Waste Hotspot form
const WasteHotspotSchema = z.object({
    date: z.string().nonempty("Date is required"),
    time: z.string().nonempty("Time is required"),
    additionalInstructions: z.string().optional(),
    selectedSitios: z.array(z.string()).optional(),
    selectedAnnouncements: z.array(z.string()).optional(),
    watchman: z.string().nonempty("Watchman is required"),
});

// Export the schema
export default WasteHotspotSchema;