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

const ClerkDonateCreateSchema = z.object({
  don_num: z.string().optional(),
  don_donor: z.string().min(1, "Donor name or 'Anonymous' is required"),
  per_id: z.number().nullable().optional(),
  don_item_name: z.string().min(1, "Item name is required"),
  don_qty: DataRequirement,
  don_description: z.string().optional(),
  don_category: z.string().min(1, "Category is required"),
  don_date: z.string().min(1, "Donation date is required"),
  don_status: z.enum(["Stashed", "Allotted"]).default("Stashed"),
  staff: z.string().optional().nullable(),
});

export default ClerkDonateCreateSchema;