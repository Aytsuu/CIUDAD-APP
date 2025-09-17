import {z} from "zod"

export const SummonTimeSchema = z.object({
  start_time: z.string().nonempty('This field is requried'),
  sd_id: z.string().default(''),
});  

