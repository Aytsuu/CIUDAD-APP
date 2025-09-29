import { api } from "@/api/api";

export const updateWasteReport = async (rep_id: string, wasteReportInfo: Record<string, any>) => {

    try{

        const currentTimestamp = new Date().toISOString();

        console.log("REPORT DATA REQ: ",{
            rep_status: wasteReportInfo.rep_status,
            rep_date_resolved: currentTimestamp,
            staff_id: wasteReportInfo.staff_id
        })

        const res = await api.put(`waste/update-waste-report/${rep_id}/`,{
            rep_status: wasteReportInfo.rep_status,
            rep_date_resolved: currentTimestamp,
            staff_id: wasteReportInfo.staff_id
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}



export const uploadResolvedImage = async (data: {
  rep_id: string;
  file_data: {
    name: string;
    type: string;
    file: any;
  };
}) => {
  try {
    // Create the payload that matches your serializer's _upload_files method
    const payload = {
      rep_id: data.rep_id,
      files: [{
        name: data.file_data.name,
        type: data.file_data.type,
        file: data.file_data.file // The actual file object
      }]
    };

    const res = await api.post('waste/waste-rep-rslv-file/', payload);
    return res.data;
  } catch (err) {
    console.error(`Failed to create file ${data.file_data.name}:`, err);
    throw err;
  }
}