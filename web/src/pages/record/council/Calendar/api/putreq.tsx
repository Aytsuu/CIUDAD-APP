import api from "@/pages/api/api";
import { formatDate } from "@/helpers/dateFormatter";

export const putEvent_meetingreq = async (ce_id: number, event_meetingInfo: Record<string, any>) => {
try{
    const res = await api.put("council/event-meeting/", {
      ce_id: event_meetingInfo.ce_id,
      ce_title: event_meetingInfo.ce_id,
      ce_place: event_meetingInfo.ce_place,
      ce_date: formatDate(event_meetingInfo.ce_date),
      ce_time: event_meetingInfo.ce_time,
      ce_type: event_meetingInfo.ce_type,
      ce_description: event_meetingInfo.ce_description,
      staff: event_meetingInfo.staff,
    });

    return res.data.ce_id;
  } catch (err) {
    console.error(err);
  }
};
