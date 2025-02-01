import { z } from 'zod';

const WasteColSchedSchema = z.object({
    date: z.string().nonempty("Date is required"),
    time: z.string().nonempty("Time is required"),
    additionalInstructions: z.string().optional(),
    selectedSitios: z.array(z.string()).optional(),
    selectedCollectors: z.array(z.string()).optional(),
    driver: z.string().nonempty("Driver is required"),
    selectedAnnouncements: z.array(z.string()).optional(),
});

export default WasteColSchedSchema;