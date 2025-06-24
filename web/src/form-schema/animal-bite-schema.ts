import { z } from "zod"

const ReferralFormSchema = z.object({
  pat_id: z.string(),
  receiver: z.string().nonempty("Receiver is required"),
  sender: z.string().nonempty("Sender is required"),
  date: z.string().nonempty("Date is required"),
  transient: z.boolean().default(false),

  // Patient Information
  p_lname: z.string().nonempty("Last name is required"),
  p_fname: z.string().nonempty("First name is required"),
  p_mname: z.string().optional(),
  p_address: z.string().nonempty("Address is required"),
  p_age: z.coerce.number().min(1, "Age must be a positive number"),
  p_gender: z.string().nonempty("Gender is required"),

  // Animal Bite Details
  exposure_type: z.string().nonempty("Exposure type is required"),
  exposure_site: z.string().nonempty("Site of exposure is required"),
  biting_animal: z.string().nonempty("Biting animal is required"),
 
  p_actions: z.string().nonempty("Actions needed"),
  p_referred: z.string().nonempty("Referred required")
})

export default ReferralFormSchema

