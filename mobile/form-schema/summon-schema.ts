import { z } from 'zod';

const SummonSchema = z.object({
  sd_id: z.string().min(1, "Date of the hearing is required." ),
  st_id: z.string().min(1, "Time of the hearing is required." ),
  ss_mediation_level: z.string().min(1, "Mediation is required."),
  sr_id: z.string().default(''),
});

export default SummonSchema





