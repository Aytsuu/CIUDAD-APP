import { z } from "zod"

const ReferralFormSchema = z.object({
  // Patient ID
  pat_id: z.string().min(1, "Patient selection is required"),

  // Referral Information
  receiver: z.string().min(1, "Receiver is required"),
  sender: z.string().min(1, "Sender is required"),
  date: z.string().min(1, "Date is required"),
  transient: z.boolean().default(false),

  // Patient Information (for display only)
  p_lname: z.string().min(1, "Last name is required"),
  p_fname: z.string().min(1, "First name is required"),
  p_mname: z.string().optional(),
  p_address: z.string().optional(),
  p_age: z.coerce.number().min(0, "Age must be a positive number"),
  p_gender: z.string().min(1, "Gender is required"),

  // Animal Bite Details
  exposure_type: z.string().min(1, "Exposure type is required"),
  exposure_site: z.string().min(1, "Site of exposure is required"),
  biting_animal: z.string().min(1, "Biting animal is required"),
  actions_taken: z.string().min(1, "Actions taken is required"),
  referredby: z.string().min(1, "Referred by is required"),
})

export default ReferralFormSchema