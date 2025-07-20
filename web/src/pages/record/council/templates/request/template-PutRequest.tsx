import {api} from "@/api/api";

export const updateTemplateRec = async (temp_id: number, templateInfo: Record<string, any>) => {

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
            temp_body: templateInfo.temp_body
        })

        const res = await api.put(`council/update-template/${temp_id}/`,{
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
            temp_body: templateInfo.temp_body
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}