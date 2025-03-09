import { z } from 'zod';

// Define the schema for the Waste Hotspot form
const GADCreateBudgetTrackerSchema = z.object({
    startingBal: z.string().nonempty("Starting Balance is required"),
    year: z.string().nonempty("Year is required"),
});

// Export the schema
export default GADCreateBudgetTrackerSchema;