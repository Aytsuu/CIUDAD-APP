import { z } from "zod";

export const ARFormBaseSchema = z.object({
  ar_title: z.string().min(1),
  ar_date_started: z.string().date(),
  ar_time_started: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  ar_date_completed: z.string().date(),
  ar_time_completed: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  ar_action_taken: z.string().min(1, "Required."),
  ar_result: z.string().min(1, "Required")
})

export const ARActivityFormSchema = ARFormBaseSchema.extend({
  ir_sitio: z.string().min(1, 'Required'),
  ir_street: z.string().min(1, 'Required')
});

export const getARFormSchema = (selected?: string) => {
  if(!selected) {
    return ARActivityFormSchema;
  } else {
    return ARFormBaseSchema;
  }
}