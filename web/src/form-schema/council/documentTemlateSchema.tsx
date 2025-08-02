// import { z } from "zod"


// const documentTemplateFormSchema = z.object({
    
//     temp_header: z.string(),
//     temp_below_headerContent: z.string(),
//     temp_title: z.string().min(1, 'Template title is required'),
//     temp_subtitle: z.string(),
//     temp_paperSize: z.string(),
//     temp_margin: z.string(),
//     temp_filename: z.string().min(1, 'Filename is required'),
//     temp_w_sign: z.boolean(),
//     temp_w_seal: z.boolean(),
//     temp_w_summon: z.boolean(),
//     temp_body: z.string().min(1, 'Template body is required')

// });

// export default documentTemplateFormSchema;





import { z } from "zod";

const documentTemplateFormSchema = z.object({
    temp_header: z.string(),
    temp_below_headerContent: z.string(),
    temp_title: z.string().min(1, 'Template title is required'),
    temp_subtitle: z.string(),
    temp_paperSize: z.string(),
    temp_margin: z.string(),
    temp_filename: z.string(),
    temp_w_sign: z.boolean(),
    temp_w_seal: z.boolean(),
    temp_w_summon: z.boolean(),
    temp_body: z.string().min(1, 'Template body is required'),
    selectedPurposeRates: z.array(z.string()).min(1, "Please select at least one purpose"),
    // selectedPurposeRates: z.array(z.string()),
}).refine(data => data.temp_w_sign || data.temp_w_seal || data.temp_w_summon, {
    message: "Footer is requires",
    path: ["temp_w_sign"] // This points to one of the fields for error display
});

export default documentTemplateFormSchema;



