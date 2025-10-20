import z from "zod";

export const landingEditFormSchema = z.object({
  cpt_name: z.string().min(1, "This field must not be empty"),
  cpt_photo: z.object({
    name: z.string(),
    type: z.string(),
    file: z.string(),
    url: z.string().optional()
  }),
  contact: z.string().min(1, "This field must not be empty"),
  email: z.string().min(1, "This field must not be empty"),
  address: z.string().min(1, "This field must not be empty"),
  quote: z.string().min(1, "This field must not be empty"),
  mission: z.string().min(1, "This field must not be empty"),
  vision: z.string().min(1, "This field must not be empty"),
  values: z.string().min(1, "This field must not be empty"),
})