import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";

export const addAcknowledgementReport = async (arInfo: Record<string, string>) => {
  try {
    const res = await api.post('drr/ar/', { 
      ar_incident_activity: arInfo.name,
      ar_location: arInfo.location,
      ar_date_started: formatDate(arInfo.dateStarted),
      ar_time_started: arInfo.timeStarted,
      ar_date_completed: formatDate(arInfo.dateCompleted),
      ar_time_completed: arInfo.timeCompleted,
      ar_action: arInfo.action,
      sitio: arInfo.sitio, 
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
}

export const addAcknowledgementReportFile = async (arId: string, fileId: string) => {
  try {
    const res = await api.post('drr/ar/file/', {
      ar: arId,
      file: fileId
    })

    return res.data
  } catch (err) {
    console.log(err);
  }
}