import { z } from 'zod';

const ClerkDonateCreateSchema = z.object({
    don_donorfname: z.string().nonempty("Donor first name is required"), // Donor first name
    don_donorlname: z.string().nonempty("Donor last name is required"), // Donor last name
    don_item_name: z.string().nonempty("Item name is required"), // Item name
    don_qty: z.string().nonempty("Item quantity is required"), // Item quantity
    don_category: z.string().nonempty("Item category is required"), // Item category
    don_receiver: z.string().nonempty("Receiver is required"), // Receiver
    don_description: z.string().optional(), // Item description (optional)
    don_date: z.string().nonempty("Donation date is required"), // Donation date
});

export default ClerkDonateCreateSchema;