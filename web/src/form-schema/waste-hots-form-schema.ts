import { z } from 'zod';

// Define the schema for the Waste Hotspot form
export const WasteHotspotSchema = z.object({
    date: z.string().date().nonempty("Date is required"),
    start_time: z.string().nonempty("Time is required"),
    end_time: z.string().nonempty("Time is required"),
    additionalInstructions: z.string().optional(),
    sitio:z.string().nonempty("Sitio is required"),
    selectedAnnouncements: z.array(z.string()).optional(),
    watchman: z.string().nonempty("Watchman is required"),
});

export const WasteHotspotEditSchema = z.object({
    date: z.string().date().nonempty("Date is required"),
    start_time: z.string().nonempty("Time is required"),
    end_time: z.string().nonempty("Time is required"),
    additionalInstructions: z.string().optional(),
    sitio:z.string().nonempty("Sitio is required"),
    selectedAnnouncements: z.array(z.string()).optional(),
    watchman: z.string().nonempty("Watchman is required"),
    wh_num:  z.string().default(''),
});

