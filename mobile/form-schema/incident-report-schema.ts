import { z } from "zod";

export const IncidentReportSchema = z.object({
  ir_type: z.string().min(1),
  ir_add_details: z.string().min(1),
  ir_date: z.string().min(1),
  ir_time: z.string().min(1),
  ir_area: z.string().min(1),
  ir_involved: z.string()
})