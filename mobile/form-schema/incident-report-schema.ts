import { z } from "zod";

export const IncidentReportSchema = z.object({
  ir_type: z.string()
    .min(1),
  ir_add_details: z.string()
    .min(1),
  ir_street: z.string()
    .min(1),
  ir_sitio: z.string()
    .min(1),
})