import api from '@/pages/api/api';
import { formatDate } from '@/helpers/dateFormatter';

export const putCouncilEvent = async (ce_id: number, eventInfo: Record<string, any>) => {
    try {
        const res = await api.put(`council/event-meeting/${ce_id}/`, {
            ce_title: eventInfo.ce_title,
            ce_place: eventInfo.ce_place,
            ce_date: formatDate(eventInfo.ce_date),
            ce_time: eventInfo.ce_time,
            ce_type: eventInfo.ce_type,
            ce_description: eventInfo.ce_description,
            ce_is_archive: eventInfo.ce_is_archive || false,
            ...(eventInfo.staff_id !== undefined && { staff_id: eventInfo.staff_id }),
        });

        console.log("PUT request successful, response:", res.data); // Log success
        return res.data;
    } catch (err: any) {
        console.error("Error updating council event:", err);
        console.log("Server response details:", {
            status: err.response?.status,
            data: err.response?.data || "No error data returned",
            headers: err.response?.headers,
        }); // Ensure detailed error log
        throw err;
    }
};

export const putAttendee = async (atn_id: number, attendeeInfo: Record<string, any>) => {
  try {
    const res = await api.patch(`council/attendees/${atn_id}/`, { // Explicitly use PATCH
      atn_present_or_absent: attendeeInfo.atn_present_or_absent,
    });
    console.log("PATCH request successful, response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error updating attendee:", err);
    if (err.response) {
      console.log("Server response details:", {
        status: err.response.status,
        data: err.response.data || "No error data returned",
        headers: err.response.headers,
      });
    }
    throw err;
  }
};
export const putAttendanceSheet = async (att_id: number, attendanceInfo: Record<string, any>) => {
    try {
        const res = await api.put(`council/attendance-sheet/${att_id}/`, {
            ce_id: attendanceInfo.ce_id,
            file_id: attendanceInfo.file_id,
            staff_id: attendanceInfo.staff_id,
        });

        return res.data;
    } catch (err) {
        console.error("Error updating attendance sheet:", err);
        throw err;
    }
};