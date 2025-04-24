import { z } from 'zod';

const DataRequirement = z.union([
  z.string()
      .default("")
      .refine((val) => val.trim() !== "", { message: "This field is required" }) 
      .transform((val) => parseFloat(val))
      .refine((val) => val > -1, { message: "Value must be a positive number" }), 
  z.number()
      .refine((val) => val > -1, { message: "Value must be a positive number" }) 
]).transform((val) => String(val));

const GADAddEntrySchema = z.object({
gbud_type: z.string().min(1, "Entry type is required"),
gbud_amount: DataRequirement,
gbud_particulars: z.string().min(1, "Particulars are required"),
gbud_add_notes: z.string().optional(),
gbud_receipt: z.string().optional(),
gbud_remaining_bal: DataRequirement.optional(), // Made optional here
gbudy_num: z.number().min(1, "Budget year reference is required"),
});

// Export the schema
export default GADAddEntrySchema;