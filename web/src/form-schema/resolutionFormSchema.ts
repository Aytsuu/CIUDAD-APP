import { z } from "zod"


const resolutionFormSchema = z.object({
    
    resTitle: z.string().min(1, 'Ordinance title is required'),
    resDate: z.string().date(),
    resDetails: z.string(),
    resAreaOfFocus: z.array(z.string()).nonempty(),


});

export default resolutionFormSchema;