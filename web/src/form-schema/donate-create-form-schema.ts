import { z } from 'zod';

const ClerkDonateCreateSchema = z.object({
    // don_num: z.number().optional(), 
    don_donorfname: z.string().nonempty("Donor first name is required"), 
    don_donorlname: z.string().nonempty("Donor last name is required"), 
    don_item_name: z.string().nonempty("Item name is required"), 
    don_qty: z.coerce.number().min(1),
    don_category: z.string().nonempty("Item category is required"), 
    don_receiver: z.string().nonempty("Receiver is required"), 
    don_description: z.string().nonempty("Please put 'None' or 'N/A' if not applicable"), 
    don_date: z.string().nonempty("Donation date is required"), 
});

export default ClerkDonateCreateSchema;