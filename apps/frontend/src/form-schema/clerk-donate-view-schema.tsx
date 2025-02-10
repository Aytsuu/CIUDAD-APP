import { z } from 'zod';

const ClerkDonateViewSchema = z.object({
    donorName: z.string().optional(), 
    itemname: z.string().optional(), 
    itemqty: z.string().optional(), 
    itemcategory: z.string().optional(),
    receiver: z.string().optional(),
    itemDescription: z.string().optional(),
});

export default ClerkDonateViewSchema;