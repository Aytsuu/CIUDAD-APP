import { api } from "@/api/api";

export const updateWasteReport = async (rep_id: number, wasteReportInfo: Record<string, any>) => {

    try{

        const currentTimestamp = new Date().toISOString();

        console.log("REPORT DATA REQ: ",{
            rep_status: wasteReportInfo.rep_status,
            rep_date_resolved: currentTimestamp,
        })

        const res = await api.put(`waste/update-waste-report/${rep_id}/`,{
            rep_status: wasteReportInfo.rep_status,
            rep_date_resolved: currentTimestamp,
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}




interface UploadResolvedImageParams {
  rep_id: number;
  wrsf_name: string;
  wrsf_type: string;
  wrsf_path: string;
  wrsf_url: string;
}

export const uploadResolvedImage = async (params: UploadResolvedImageParams) => {

    console.log("NI SUD SA REQ: ",{
        rep_id: params.rep_id,
        wrsf_name: params.wrsf_name,
        wrsf_type: params.wrsf_type,
        wrsf_path: params.wrsf_path,
        wrsf_url: params.wrsf_url,
    })

  const response = await api.post('waste/waste-rep-rslv-file/', {
    rep_id: params.rep_id,
    wrsf_name: params.wrsf_name,
    wrsf_type: params.wrsf_type,
    wrsf_path: params.wrsf_path,
    wrsf_url: params.wrsf_url,
  });
  return response.data;
};