import { z } from 'zod';

const SummonSchema = z.object({
  reason: z.string().min(1, "Reason is required." ),
  hearingDate: z.string().min(1, "Date of the hearing is required." ),
  hearingTime: z.string().min(1, "Time of the hearing is required." ),
  sr_id: z.string().default(''),
  template: z.string().nonempty('Select a template.')
});

export default SummonSchema;
