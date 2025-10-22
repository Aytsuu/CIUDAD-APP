import { z } from 'zod';

const SummonSchema = z.object({
  sd_id: z.string().min(1, "Date of the hearing is required." ),
  st_id: z.string().min(1, "Time of the hearing is required." ),
  hs_level: z.string().min(1, "Mediation is required."),
  sc_id: z.string().default(''),
});

export default SummonSchema




