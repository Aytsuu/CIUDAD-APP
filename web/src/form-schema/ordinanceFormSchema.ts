import { z } from "zod"


const ordinanceFormSchema = z.object({
    
    ordTitle: z.string().min(1, 'Ordinance title is required'),
    ordTag: z.string(),
    ordDesc: z.string(),
    ordDate: z.string().date(),
    ordDetails: z.string(), // FILE TYPEEE
    ordAreaOfFocus: z.array(z.string()).nonempty(),

});

export default ordinanceFormSchema;