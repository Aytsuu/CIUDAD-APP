import api from "@/pages/api/api";
import { formatDate } from "@/helpers/dateFormatter";

export const postEvent_meetingreq = async (
  event_meetingInfo: Record<string, any>
) => {
  const timeString = event_meetingInfo.ce_time.length === 5 ? event_meetingInfo.ce_time + ":00" : event_meetingInfo.ce_time;
  try {
    console.log({
      ce_id: event_meetingInfo.ce_id,
      ce_title: event_meetingInfo.ce_id,
      ce_place: event_meetingInfo.ce_place,
      ce_date: event_meetingInfo.ce_date,
      ce_time: timeString,
      ce_type: event_meetingInfo.ce_type,
      ce_description: event_meetingInfo.ce_description,
      staff: event_meetingInfo.staff,
    });

    const res = await api.post("council/event-meeting/", {
      ce_id: event_meetingInfo.ce_id,
      ce_title: event_meetingInfo.ce_id,
      ce_place: event_meetingInfo.ce_place,
      ce_date: event_meetingInfo.ce_date,
      ce_time: timeString,
      ce_type: event_meetingInfo.ce_type,
      ce_description: event_meetingInfo.ce_description,
      staff: event_meetingInfo.staff,
    });

    return res.data.ce_id;
  } catch (err) {
    console.error(err);
  }
};
