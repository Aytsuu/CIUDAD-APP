import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";


export const updateWasteReport = async (rep_id: number, wasteReportInfo: Record<string, any>) => {

    try{

        const currentTimestamp = new Date().toISOString();

        console.log("REPORT DATA REQ: ",{
            rep_status: wasteReportInfo.rep_status,
            rep_resolved_img: wasteReportInfo.rep_resolved_img,
            rep_date_resolved: currentTimestamp,
        })

        const res = await api.put(`waste/update-waste-report/${rep_id}/`,{
            rep_status: wasteReportInfo.rep_status,
            rep_resolved_img: wasteReportInfo.rep_resolved_img,
            rep_date_resolved: currentTimestamp,
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}