import { z } from 'zod';

const ClerkDonateCreateSchema = z.object({
    donorName: z.string().nonempty("Donor name is required"), 
    itemname: z.string().nonempty("Item name is required"), 
    itemqty: z.string().nonempty("Item quantity is required"), 
    itemcategory: z.string().nonempty("Item category is required"),
    receiver: z.string().nonempty(""),
    itemDescription: z.string().optional(),
});

export default ClerkDonateCreateSchema;