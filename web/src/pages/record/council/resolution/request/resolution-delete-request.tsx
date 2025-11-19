import {api} from "@/api/api";


export const deleteResolution = async (res_num: string, staffId?: string) => {
    try {
        const res = await api.delete(`council/delete-resolution/${res_num}/`, {
            data: {
                staff_id: staffId
            }
        });
        console.log("IETNUM: ", res_num)
        return res.data; // Return the response data if needed man gali
    } catch (err) {
        console.error("IETNUM: ", res_num)
        console.error("Error deleting entry:", err);
        throw err; // Rethrow the error to handle it in the component
    }
};


export const archiveOrRestoreRes = async (res_num: string, resolutionInfo: Record<string, any>) => {

    try{

        console.log({
            res_is_archive: resolutionInfo.res_is_archive,
            staff_id: resolutionInfo.staff_id
        })

        const res = await api.put(`council/update-resolution/${res_num}/`,{
            res_is_archive: resolutionInfo.res_is_archive,
            staff_id: resolutionInfo.staff_id
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}