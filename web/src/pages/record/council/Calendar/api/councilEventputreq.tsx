import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateHelper";
import { AttendanceSheetInput } from "../councilEventTypes";

export const putCouncilEvent = async (
  ce_id: number,
  eventInfo: Record<string, any>
) => {
  try {
    const res = await api.put(`council/event-meeting/${ce_id}/`, {
      ce_title: eventInfo.ce_title,
      ce_place: eventInfo.ce_place,
      ce_date: formatDate(eventInfo.ce_date),
      ce_time: eventInfo.ce_time,
      ce_description: eventInfo.ce_description,
      ce_is_archive: eventInfo.ce_is_archive || false,
      ...(eventInfo.ce_rows !== undefined && { ce_rows: eventInfo.ce_rows }),
      // ...(eventInfo.staff_id !== undefined && { staff_id: eventInfo.staff_id }),
    });

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

// export const putAttendee = async (
//   atn_id: number,
//   attendeeInfo: Record<string, any>
// ) => {
//   try {
//     const res = await api.patch(`council/attendees/${atn_id}/`, {
//       // Explicitly use PATCH
//       atn_present_or_absent: attendeeInfo.atn_present_or_absent,
//     });

//     return res.data;
//   } catch (err: any) {
//     throw err;
//   }
// };

export const putAttendanceSheet = async (
  att_id: number,
  attendanceInfo: Partial<AttendanceSheetInput>
) => {
  try {
    const res = await api.put(
      `council/attendance-sheets/${att_id}/`,
      attendanceInfo
    );
    return res.data;
  } catch (err) {
    throw err;
  }
};

// export const updateAttendees = async (
//   ce_id: number,
//   attendees: {
//     atn_name: string;
//     atn_designation: string;
//     atn_present_or_absent: string;
//   }[]
// ) => {
//   try {
//     if (!attendees.length) {
//       throw new Error("Attendees array cannot be empty");
//     }
//     const res = await api.post("council/attendees/bulk/", {
//       ce_id: ce_id, // Keep at root level for reference
//       attendees: attendees.map((a) => ({
//         atn_name: a.atn_name,
//         atn_designation: a.atn_designation,
//         atn_present_or_absent: a.atn_present_or_absent,
//         ce_id: ce_id, // Add ce_id to each attendee object
//       })),
//     });

//     return res.data;
//   } catch (err: any) {
//     throw err;
//   }
// };