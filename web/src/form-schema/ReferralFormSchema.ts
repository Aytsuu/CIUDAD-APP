import { z } from 'zod';

export const ReferralFormSchema = z.object({
    receiver: z.string().nonempty("Receiver is required"),
    sender: z.string().nonempty("Sender is required"),
    date: z.string().nonempty("Date is required").regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    transient: z.boolean().default(false),
    p_lname: z.string().nonempty("Last name is required"),
    p_fname: z.string().nonempty("First name is required"),
    p_mname: z.string().optional(), 
    p_address: z.string().nonempty("Address is required"),
    p_age: z.coerce.number().min(0, "Age must be a positive number").nonnegative("Invalid age"),
    p_gender: z.string().nonempty("Gender is required"),
    exposure_type: z.string().nonempty("Exposure type is required"),
    exposure_site: z.string().nonempty("Site of exposure is required"),
    biting_animal: z.string().nonempty("Biting animal is required"),
    p_actions: z.string().nonempty("Actions required"),
    p_referred: z.string().nonempty("Referred by is required"),
});

export default ReferralFormSchema;
