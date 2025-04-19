import { z } from 'zod';

const GADAddBudgetYearSchema = z.object({
    year: z.string(z.string()).nonempty("Year is required").regex(/^\d{4}$/, "Year must be in YYYY format"),
});

// Export the schema
export default GADAddBudgetYearSchema;
