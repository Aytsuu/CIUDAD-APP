import {api} from "@/api/api";
import { parseFloatSafe } from '@/helpers/floatformatter';
import { capitalize } from "@/helpers/capitalize";
import { useState } from "react";


// export const template_record = async (templateInfo: Record<string, any>) => {

//     try{


//         console.log({
//             temp_header: templateInfo.temp_header,
//             temp_below_headerContent: templateInfo.temp_below_headerContent,
//             temp_title: templateInfo.temp_title,
//             temp_subtitle: templateInfo.temp_subtitle,
//             temp_w_sign:  templateInfo.temp_w_sign,
//             temp_w_seal: templateInfo.temp_w_seal,
//             temp_w_summon: templateInfo.temp_w_summon,
//             temp_paperSize: templateInfo.temp_paperSize,
//             temp_margin: templateInfo.temp_margin,
//             temp_filename: templateInfo.temp_filename,
//             temp_body: templateInfo.temp_body
//         })

//         const res = await api.post('council/template/',{

//             temp_header: templateInfo.temp_header,
//             temp_below_headerContent: templateInfo.temp_below_headerContent,
//             temp_title: templateInfo.temp_title,
//             temp_subtitle: templateInfo.temp_subtitle,
//             temp_w_sign:  templateInfo.temp_w_sign,
//             temp_w_seal: templateInfo.temp_w_seal,
//             temp_w_summon: templateInfo.temp_w_summon,
//             temp_paperSize: templateInfo.temp_paperSize,
//             temp_margin: templateInfo.temp_margin,
//             temp_filename: templateInfo.temp_filename,
//             temp_body: templateInfo.temp_body

//         })

//         return res.data.temp_id;
//     }
//     catch (err){
//         console.error(err);
//     }
// }




export const template_record = async (templateInfo: Record<string, any>) => {

    try{


        console.log({
            temp_header: templateInfo.temp_header,
            temp_below_headerContent: templateInfo.temp_below_headerContent,
            temp_title: templateInfo.temp_title,
            temp_subtitle: templateInfo.temp_subtitle,
            temp_w_sign:  templateInfo.temp_w_sign,
            temp_w_seal: templateInfo.temp_w_seal,
            temp_w_summon: templateInfo.temp_w_summon,
            temp_paperSize: templateInfo.temp_paperSize,
            temp_margin: templateInfo.temp_margin,
            temp_filename: templateInfo.temp_filename,
            temp_body: templateInfo.temp_body,
            pr_id: templateInfo.pr_id, 
            staff_id: templateInfo.staff_id || null,
        })

        const res = await api.post('council/template/',{

            temp_header: templateInfo.temp_header,
            temp_below_headerContent: templateInfo.temp_below_headerContent,
            temp_title: templateInfo.temp_title,
            temp_subtitle: templateInfo.temp_subtitle,
            temp_w_sign:  templateInfo.temp_w_sign,
            temp_w_seal: templateInfo.temp_w_seal,
            temp_w_summon: templateInfo.temp_w_summon,
            temp_paperSize: templateInfo.temp_paperSize,
            temp_margin: templateInfo.temp_margin,
            temp_filename: templateInfo.temp_filename,
            temp_body: templateInfo.temp_body,
            pr_id: templateInfo.pr_id, 
            staff_id: templateInfo.staff_id || null,

        })

        return res.data.temp_id;
    }
    catch (err){
        console.error(err);
    }
}