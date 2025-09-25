import { z } from "zod";

export const IncidentReportSchema = z.object({
  ir_type: z.string().min(1, { message: 'Type is required' }),
  ir_add_details: z.string().min(1, { message: 'Details is required' }),
  ir_date: z.string().min(1, { message: 'Date is required' }),
  ir_time: z.string().min(1, { message: 'Time is required' }),
  ir_area: z.string().min(1, { message: 'Location is required' }),
  ir_involved: z.string()
})