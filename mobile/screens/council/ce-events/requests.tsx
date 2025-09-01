import { api } from "../../../api/api";
import { formatDate } from "@/helpers/dateFormatter";
import { Staff, AttendanceSheetInput } from "./ce-att-typeFile";

export const getCouncilEvents = async () => {
  try {
    const res = await api.get("council/event-meeting/", {
      params: { is_archive: false }, // Filter non-archived
    });
    const data = res.data?.data ?? res.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
};

export const getAttendees = async (ceId?: number) => {
  try {
    const res = await api.get("council/attendees/", {
      params: { ce_id: ceId, is_archive: false }, // Filter non-archived
    });
    const data = res.data?.data ?? res.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
};

export const getAttendanceSheets = async (isArchived?: boolean) => {
  try {
    const res = await api.get("council/attendance-sheets/", {
      params: {
        archived: isArchived,
      },
    });
    return res.data?.data ?? res.data ?? [];
  } catch (err) {
    return [];
  }
};

export const getStaffList = async (): Promise<Staff[]> => {
  try {
    const res = await api.get("council/api/staff");

    return res.data
      .map((item: any) => {
        // Normalize ID to uppercase and ensure string type
        const staffId = String(item.staff_id || "")
          .toUpperCase()
          .trim();

        if (!staffId) {
          return null;
        }

        return {
          staff_id: staffId, // Store as uppercase
          full_name: item.full_name?.trim() || `Staff ${staffId}`,
          position_title: item.position_title?.trim() || "No Designation",
        };
      })
      .filter(Boolean);
  } catch (err) {
    return [];
  }
};

export const postCouncilEvent = async (eventInfo: Record<string, any>) => {
  try {
    const res = await api.post("council/event-meeting/", {
      ce_title: eventInfo.ce_title,
      ce_place: eventInfo.ce_place,
      ce_date: formatDate(eventInfo.ce_date),
      ce_time: eventInfo.ce_time,
      ce_type: eventInfo.ce_type,
      ce_description: eventInfo.ce_description,
      ce_is_archive: eventInfo.ce_is_archive || false,
      staff_id: eventInfo.staff_id,
    });

    return res.data.ce_id;
  } catch (err) {
    throw err;
  }
};

export const postAttendee = async (attendeeInfo: Record<string, any>) => {
  try {
    const res = await api.post("council/attendees/", {
      atn_name: attendeeInfo.atn_name,
      atn_designation: attendeeInfo.atn_designation,
      atn_present_or_absent: attendeeInfo.atn_present_or_absent,
      ce_id: attendeeInfo.ce_id,
      staff_id: attendeeInfo.staff_id,
    });

    return res.data.atn_id;
  } catch (err) {
    throw err;
  }
};

export const addAttendanceSheets = async (
  ceId: number,
  files: Array<{
    name: string;
    type: string;
    file: string; // base64
    path: string;
  }>
) => {
  try {
    const response = await api.post(`council/attendance-sheets/`, {
      ce_id: ceId,
      files: files,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to upload files");
  }
};

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
      ce_type: eventInfo.ce_type,
      ce_description: eventInfo.ce_description,
      ce_is_archive: eventInfo.ce_is_archive || false,
      ...(eventInfo.staff_id !== undefined && { staff_id: eventInfo.staff_id }),
    });
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const putAttendee = async (
  atn_id: number,
  attendeeInfo: Record<string, any>
) => {
  try {
    const res = await api.patch(`council/attendees/${atn_id}/`, {
      atn_present_or_absent: attendeeInfo.atn_present_or_absent,
    });
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

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

export const updateAttendees = async (
  ce_id: number,
  attendees: {
    atn_name: string;
    atn_designation: string;
    atn_present_or_absent: string;
  }[]
) => {
  try {
    if (!attendees.length) {
      throw new Error("Attendees array cannot be empty");
    }
    const res = await api.post("council/attendees/bulk/", {
      ce_id: ce_id, // Keep at root level for reference
      attendees: attendees.map((a) => ({
        atn_name: a.atn_name,
        atn_designation: a.atn_designation,
        atn_present_or_absent: a.atn_present_or_absent,
        ce_id: ce_id, // Add ce_id to each attendee object
      })),
    });
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const delCouncilEvent = async (
  ce_id: number,
  permanent: boolean = false
) => {
  // Validate ID first
  if (!ce_id || isNaN(ce_id)) {
    throw new Error(`Invalid event ID: ${ce_id}`);
  }

  try {
    const res = await api.delete(`council/event-meeting/${ce_id}/`, {
      params: { permanent },
    });

    return res.data;
  } catch (err) {
    throw err;
  }
};

export const restoreCouncilEvent = async (ce_id: number) => {
  try {
    const res = await api.put(`council/event-meeting/${ce_id}/restore/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const delAttendee = async (atn_id: number) => {
  try {
    const res = await api.delete(`council/attendees/${atn_id}/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const delAttendanceSheet = async (
  att_id: number,
  permanent: boolean = false
) => {
  if (!att_id || isNaN(att_id)) {
    throw new Error(`Invalid attendance sheet ID: ${att_id}`);
  }

  try {
    const res = await api.delete(`council/attendance-sheets/${att_id}/`, {
      params: { permanent },
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const restoreAttendanceSheet = async (att_id: number) => {
  try {
    const res = await api.put(`council/attendance-sheets/${att_id}/restore/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};
