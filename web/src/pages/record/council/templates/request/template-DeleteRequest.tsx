import {api} from "@/api/api";

export const deleteTemplateRec = async (temp_id: number, templateInfo: Record<string, any>) => {

    try{
        console.log({
            temp_is_archive: true,
            temp_id: temp_id
        })

        const res = await api.put(`council/update-template/${temp_id}/`,{
            temp_is_archive: true
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}