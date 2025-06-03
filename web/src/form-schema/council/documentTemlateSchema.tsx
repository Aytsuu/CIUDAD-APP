import { z } from "zod"


const documentTemplateFormSchema = z.object({
    
    temp_header: z.string(),
    temp_below_headerContent: z.string(),
    temp_title: z.string().min(1, 'Template title is required'),
    temp_paperSize: z.string(),
    temp_w_sign: z.boolean(),
    temp_w_seal: z.boolean(),
    temp_w_summon: z.boolean(),
    temp_body: z.string().min(1, 'Template body is required')

});

export default documentTemplateFormSchema;