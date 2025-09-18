import { api } from "../../../api/api";
import { formatDate } from "@/helpers/dateHelpers";
import { AttendanceSheetInput } from "./ce-att-typeFile";

export const getCouncilEvents = async () => {
  try {
    const res = await api.get("council/event-meeting/", {
      params: { is_archive: false }, // Filter non-archived
    });
    const data = res.data?.data ?? res.data ?? [];
    console.log("📊 API Response:", data);
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

export const postCouncilEvent = async (eventInfo: Record<string, any>) => {
  try {
    const res = await api.post("council/event-meeting/", {
      ce_title: eventInfo.ce_title,
      ce_place: eventInfo.ce_place,
      ce_date: formatDate(eventInfo.ce_date),
      ce_time: eventInfo.ce_time,
      ce_description: eventInfo.ce_description,
      ce_rows: eventInfo.ce_rows,
      ce_is_archive: eventInfo.ce_is_archive || false,
      staff_id: eventInfo.staff_id,
    });

    return res.data.ce_id;
  } catch (err) {
    throw err;
  }
};

export const addAttendanceSheets = async (
  ceId: number,
  files: Array<{
    name: string;
    type: string;
    file: string; 
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
      ce_description: eventInfo.ce_description,
      ce_is_archive: eventInfo.ce_is_archive || false,
      ...(eventInfo.staff_id !== undefined && { staff_id: eventInfo.staff_id }),
      ...(eventInfo.ce_rows !== undefined && { ce_rows: eventInfo.ce_rows }),
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
