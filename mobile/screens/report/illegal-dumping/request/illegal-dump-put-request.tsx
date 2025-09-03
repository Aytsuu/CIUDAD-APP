import { api } from "@/api/api";


// =========================================== STAFF ========================================================

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




export const uploadResolvedImage = async (data: {
  rep_id: number;
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


// ==================================================== RESIDENT =============================================

// Resident Cancel Report
export const updateWasteResReport = async (rep_id: number, wasteReportInfo: Record<string, any>) => {

    try{

        console.log("REPORT DATA REQ: ",{
            rep_status: wasteReportInfo.rep_status,
        })

        const res = await api.put(`waste/update-waste-report/${rep_id}/`,{
            rep_status: wasteReportInfo.rep_status,
        })

        return res.data;
    }
    catch (err){
        console.error(err);
    }
}