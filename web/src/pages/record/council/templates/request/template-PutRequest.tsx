import {api} from "@/api/api";

export const updateTemplateRec = async (temp_id: number, templateInfo: Record<string, any>) => {

    try{
        console.log({
            temp_contact_num: templateInfo.temp_contact_number,
            temp_email: templateInfo.temp_email
        })

        const res = await api.put(`council/update-template/${temp_id}/`,{
            temp_contact_num: templateInfo.temp_contact_number,
            temp_email: templateInfo.temp_email
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}