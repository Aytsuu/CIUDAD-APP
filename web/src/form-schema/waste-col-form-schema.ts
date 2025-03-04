import { z } from 'zod';

const WasteColSchedSchema = z.object({
    date: z.string().date().nonempty("Date is required"),
    time: z.string().time().nonempty("Time is required"),
    additionalInstructions: z.string().optional(),
    selectedSitios: z.array(z.string()),
    selectedCollectors: z.array(z.string()),
    driver: z.string().nonempty("Driver is required"),
    selectedAnnouncements: z.array(z.string()).optional(),
});

export default WasteColSchedSchema;