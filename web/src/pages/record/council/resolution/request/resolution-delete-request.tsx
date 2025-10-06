import {api} from "@/api/api";


export const deleteResolution = async (res_num: String) => {
    try {
        const res = await api.delete(`council/delete-resolution/${res_num}/`);
        console.log("IETNUM: ", res_num)
        return res.data; // Return the response data if needed man gali
    } catch (err) {
        console.error("IETNUM: ", res_num)
        console.error("Error deleting entry:", err);
        throw err; // Rethrow the error to handle it in the component
    }
};


export const archiveOrRestoreRes = async (res_num: String, resolutionInfo: Record<string, any>) => {

    try{

        console.log({
            res_is_archive: resolutionInfo.res_is_archive

        })

        const res = await api.put(`council/update-resolution/${res_num}/`,{
            res_is_archive: resolutionInfo.res_is_archive
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}