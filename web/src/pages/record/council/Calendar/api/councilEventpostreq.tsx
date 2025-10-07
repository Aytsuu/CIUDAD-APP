import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateHelper";

export const postCouncilEvent = async (eventInfo: Record<string, any>) => {
  try {
    const res = await api.post("council/event-meeting/", {
      ce_title: eventInfo.ce_title,
      ce_place: eventInfo.ce_place,
      ce_date: formatDate(eventInfo.ce_date),
      ce_time: eventInfo.ce_time,
      ce_description: eventInfo.ce_description,
      ce_is_archive: eventInfo.ce_is_archive || false,
      ce_rows: eventInfo.ce_rows,
      staff: eventInfo.staff,
    });

    return res.data.ce_id;
  } catch (err) {
    throw err;
  }
};

// export const postAttendee = async (attendeeInfo: Record<string, any>) => {
//   try {
//     const res = await api.post("council/attendees/", {
//       atn_name: attendeeInfo.atn_name,
//       atn_designation: attendeeInfo.atn_designation,
//       atn_present_or_absent: attendeeInfo.atn_present_or_absent,
//       ce_id: attendeeInfo.ce_id,
//       staff_id: attendeeInfo.staff_id,
//     });

//     return res.data.atn_id;
//   } catch (err) {
//     throw err;
//   }
// };

export const postAttendanceSheet = async (
  attendanceInfo: Record<string, any>
) => {
  try {
    const res = await api.post("council/attendance-sheet/", {
      ce_id: attendanceInfo.ce_id,
      file_id: attendanceInfo.file_id,
      staff_id: attendanceInfo.staff_id,
    });

    return res.data.att_id;
  } catch (err) {
    throw err;
  }
};