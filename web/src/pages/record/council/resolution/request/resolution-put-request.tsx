import {api} from "@/api/api";


export const useUpdateResolution = async (res_num: number, resolutionInfo: Record<string, any>) => {

    try{
        const staff = "00004250624";

        console.log({
            res_title: resolutionInfo.res_title,
            res_date_approved: resolutionInfo.res_date_approved,
            res_area_of_focus: resolutionInfo.res_area_of_focus,
            res_is_archive: false,
            staff_id: Number(staff),
        })

        const res = await api.put(`council/update-resolution/${res_num}/`,{
            res_title: resolutionInfo.res_title,
            res_date_approved: resolutionInfo.res_date_approved,
            res_area_of_focus: resolutionInfo.res_area_of_focus,
            res_is_archive: false,
            staff_id: staff,
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}
