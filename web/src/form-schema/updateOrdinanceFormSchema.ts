import { z } from "zod"



const updateOrdinanceFormSchema = z.object({
    
    ordTitle: z.string().min(1, "Please E"),
    ordTag: z.string(),
    ordDesc: z.string(),
    ordDate: z.string().date(),
    ordDetails: z.string(),
    ordAreaOfFocus: z.array(z.string()).nonempty(),
});

export default updateOrdinanceFormSchema;