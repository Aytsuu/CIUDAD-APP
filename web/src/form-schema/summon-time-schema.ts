import {z} from "zod"

export const SummonTimeSchema = z.object({
  start_time: z.string().nonempty('This field is requried'),
  end_time: z.string().nonempty('This field is required')
});  

