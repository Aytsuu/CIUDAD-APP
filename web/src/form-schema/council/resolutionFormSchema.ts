import { z } from "zod"


const resolutionFormSchema = z.object({
    
    res_title: z.string().min(1, 'Resolution title is required'),
    res_date_approved: z.string().date(),
    res_area_of_focus: z.array(z.string()).nonempty(),

    res_file: z.array(z.object({
        name: z.string(),
        type: z.string(),
        path: z.string(),
        url: z.string(),
    })).optional(),

});

export default resolutionFormSchema;