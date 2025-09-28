import { z } from 'zod';

const WasteColSchedSchema = z.object({
    // date: z.string().date().nonempty("Date is required"),
    day: z.string().min(1, "Collection day is required"),
    time: z.string().min(1, "Collection time is required"),
    additionalInstructions: z.string().optional(),
    selectedSitios: z.string().nonempty("Sitio is required"),
    selectedCollectors: z.array(z.string()),
    driver: z.string().nonempty("Driver is required"),
    collectionTruck: z.string().nonempty("Truck is required"),
    selectedAnnouncements: z.array(z.string()).optional(),
});

export default WasteColSchedSchema;