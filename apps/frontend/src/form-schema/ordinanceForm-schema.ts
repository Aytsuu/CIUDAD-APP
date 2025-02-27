import { z } from "zod"


const ordinanceFormSchema = z.object({
    
    ordTitle: z.string().min(1, 'Ordinance title is required'),
    ordDate: z.string().date(),
    ordDescription: z.string(), // FILE TYPEEE
    ordAreaOfFocus: z.array(z.string()).nonempty(),

});

export default ordinanceFormSchema;