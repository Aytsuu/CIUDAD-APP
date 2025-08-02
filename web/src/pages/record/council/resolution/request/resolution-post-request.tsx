import {api} from "@/api/api";




export const resolution_create = async (resolutionInfo: Record<string, any>) => {
    try{
        const staff = "00004250624";

        console.log({
            res_title: resolutionInfo.res_title,
            res_date_approved: resolutionInfo.res_date_approved,
            res_area_of_focus: resolutionInfo.res_area_of_focus,
            res_is_archive: false,
            staff_id: Number(staff),
        })

        const res = await api.post('council/resolution/',{
            res_title: resolutionInfo.res_title,
            res_date_approved: resolutionInfo.res_date_approved,
            res_area_of_focus: resolutionInfo.res_area_of_focus,
            res_is_archive: false,
            staff_id: staff,
        })

        return res.data.res_num;
    }
    catch (err){
        console.error(err);
    }
}



export const resolution_file_create = async (data: {
    res_num: number;
    file_data: {
        name: string;
        type: string;
        path: string;
        url: string;
    };
}) => {
    try {

        console.log({
            res_num: data.res_num,
            rf: data.file_data.name,
            rf_type: data.file_data.type,
            rf_path: data.file_data.path,
            rf_url: data.file_data.url
        })

        const res = await api.post('council/resolution-file/', {
            res_num: data.res_num,  
            rf_name: data.file_data.name,
            rf_type: data.file_data.type,
            rf_path: data.file_data.path,
            rf_url: data.file_data.url
        });

        return res.data;
    } catch (err) {
        console.error(`Failed to create file ${data.file_data.name}:`, err);
        throw err;
    }
}