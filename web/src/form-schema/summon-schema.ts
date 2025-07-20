import { z } from 'zod';

const SummonSchema = z.object({
  reason: z.string().min(1, { message: "Reason is required." }),
  hearingDate: z.string().min(1, { message: "Date of the hearing is required." }),
  hearingTime: z.string().min(1, { message: "Time of the hearing is required." }),
  sr_id: z.string().default('')
});

export default SummonSchema;
