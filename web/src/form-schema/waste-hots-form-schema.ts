import { z } from 'zod';

// Define the schema for the Waste Hotspot form
const WasteHotspotSchema = z.object({
    date: z.string().date().nonempty("Date is required"),
    time: z.string().nonempty("Time is required"),
    additionalInstructions: z.string().optional(),
    sitio:z.string().nonempty("Sitio is required"),
    selectedAnnouncements: z.array(z.string()).optional(),
    watchman: z.string().nonempty("Watchman is required"),
});

// Export the schema
export default WasteHotspotSchema;