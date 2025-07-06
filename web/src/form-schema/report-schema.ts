import { z } from "zod";

export const ARFormBaseSchema = z.object({
  ar_title: z.string().min(1, "Title is required."),
  ar_date_started: z.string().date("Start date must be a valid date"),
  ar_time_started: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:MM (24-hour) format."),
  ar_date_completed: z.string().date("Completion date must be a valid date."),
  ar_time_completed: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Completion time must be in HH:MM (24-hour) format."),
  ar_action_taken: z.string().min(1, "Action taken is required."),
  ar_result: z.string().min(1, "Result is required."),
});

export const ARActivityFormSchema = ARFormBaseSchema.extend({
  ir_sitio: z.string().min(1, 'Sitio is required.'),
  ir_street: z.string().min(1, 'Street is required.')
});

export const getARFormSchema = (selected?: string) => {
  if(!selected) {
    return ARActivityFormSchema;
  } else {
    return ARFormBaseSchema;
  }
}