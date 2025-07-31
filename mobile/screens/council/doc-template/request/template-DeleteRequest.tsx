import {api} from "@/api/api";

export const archiveTemplateRec = async (temp_id: number, templateInfo: Record<string, any>) => {

    try{
        console.log({
            temp_is_archive: templateInfo.temp_is_archive,
            temp_id: temp_id
        })

        const res = await api.put(`council/update-template/${temp_id}/`,{
            temp_is_archive: templateInfo.temp_is_archive
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}



export const deleteTemplate= async (temp_id: number) => {
    try {
        const res = await api.delete(`council/delete-template/${temp_id}/`);
        console.log("TEMP_ID: ", temp_id)
        return res.data; // Return the response data if needed
    } catch (err) {
        console.error("TEMP_ID: ", temp_id)
        console.error("Error deleting template:", err);
        throw err; // Rethrow the error to handle it in the component
    }
};