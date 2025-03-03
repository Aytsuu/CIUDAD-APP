import { z } from "zod"



const updateOrdinanceFormSchema = z.object({
    
    ordTitle: z.string().min(1, "Please E"),
    ordDate: z.string().date(),
    ordDescription: z.string(),
    ordAreaOfFocus: z.array(z.string()).nonempty(),
});

export default updateOrdinanceFormSchema;