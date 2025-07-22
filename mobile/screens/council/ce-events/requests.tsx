import { api } from "../../../api/api";
import { formatDate } from "@/helpers/dateHelpers";
import { AttendanceSheetInput } from "./queries";

export type Staff = {
  staff_id: string;
  full_name: string;
  position_title: string;
};

export const getCouncilEvents = async () => {
    try {
        const res = await api.get('council/event-meeting/', {
            params: { is_archive: false }  // Filter non-archived
        });
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error fetching council events:", err);
        return [];
    }
};

export const getAttendees = async (ceId?: number) => {
    try {
        const res = await api.get('council/attendees/',{
            params: { ce_id: ceId, is_archive: false }  // Filter non-archived
        });
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error fetching attendees:", err);
        return [];
    }
};

export const getAttendanceSheets = async (isArchived?: boolean) => {
  try {
    const res = await api.get('council/attendance-sheets/', {
      params: { 
        archived: isArchived,
      }
    });
    return res.data?.data ?? res.data ?? [];
  } catch (err) {
    console.error("Error fetching attendance sheets:", err);
    return [];
  }
};

export const getStaffList = async (): Promise<Staff[]> => {
  try {
    const res = await api.get('council/api/staff');
    
    return res.data.map((item: any) => {
      // Normalize ID to uppercase and ensure string type
      const staffId = String(item.staff_id || '').toUpperCase().trim();
      
      if (!staffId) {
        console.warn('Staff item with missing ID:', item);
        return null;
      }

      return {
        staff_id: staffId, // Store as uppercase
        full_name: item.full_name?.trim() || `Staff ${staffId}`,
        position_title: item.position_title?.trim() || "No Designation",
      };
    }).filter(Boolean);
  } catch (err) {
    console.error('Error fetching staff list:', err);
    return [];
  }
};

export const postCouncilEvent = async (eventInfo: Record<string, any>) => {
    try {
        console.log({
            ce_title: eventInfo.ce_title,
            ce_place: eventInfo.ce_place,
            ce_date: formatDate(eventInfo.ce_date),
            ce_time: eventInfo.ce_time,
            ce_type: eventInfo.ce_type,
            ce_description: eventInfo.ce_description,
            ce_is_archive: eventInfo.ce_is_archive || false,
            staff_id: eventInfo.staff_id,
        });

        const res = await api.post('council/event-meeting/', {
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
        console.error("Error creating council event:", err);
        throw err;
    }
};

export const postAttendee = async (attendeeInfo: Record<string, any>) => {
    try {
        console.log({
            atn_present_or_absent: attendeeInfo.atn_present_or_absent,
            ce_id: attendeeInfo.ce_id,
            staff_id: attendeeInfo.staff_id,
        });

        const res = await api.post('council/attendees/', {
            atn_name: attendeeInfo.atn_name,
            atn_designation: attendeeInfo.atn_designation,
            atn_present_or_absent: attendeeInfo.atn_present_or_absent,
            ce_id: attendeeInfo.ce_id,
            staff_id: attendeeInfo.staff_id,
        });

        return res.data.atn_id;
    } catch (err) {
        console.error("Error creating attendee:", err);
        throw err;
    }
};

export const postAttendanceSheet = async (attendanceInfo: AttendanceSheetInput) => {
  try {
    const res = await api.post('council/attendance-sheets/', {
      ce_id: attendanceInfo.ce_id,
      att_file_name: attendanceInfo.att_file_name,
      att_file_path: attendanceInfo.att_file_path,
      att_file_url: attendanceInfo.att_file_url,
      att_file_type: attendanceInfo.att_file_type,
      staff_id: attendanceInfo.staff_id,
    });
    return res.data;
  } catch (err) {
    console.error("Error creating attendance sheet:", err);
    throw err;
  }
};

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

export const putAttendanceSheet = async (att_id: number, attendanceInfo: Partial<AttendanceSheetInput>) => {
  try {
    const res = await api.put(`council/attendance-sheets/${att_id}/`, attendanceInfo);
    return res.data;
  } catch (err) {
    console.error("Error updating attendance sheet:", err);
    throw err;
  }
};

export const updateAttendees = async (ce_id: number, attendees: { atn_name: string; atn_designation: string; atn_present_or_absent: string }[]) => {
  try {
    if (!attendees.length) {
      throw new Error("Attendees array cannot be empty");
    }
    const res = await api.post('council/attendees/bulk/', {
      ce_id: ce_id,  // Keep at root level for reference
      attendees: attendees.map(a => ({
        atn_name: a.atn_name,
        atn_designation: a.atn_designation,
        atn_present_or_absent: a.atn_present_or_absent,
        ce_id: ce_id,  // Add ce_id to each attendee object
      })),
    });
    console.log("Bulk update successful, response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error updating attendees:", err);
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

export const delCouncilEvent = async (ce_id: number, permanent: boolean = false) => {
    // Validate ID first
    if (!ce_id || isNaN(ce_id)) {
        throw new Error(`Invalid event ID: ${ce_id}`);
    }

    try {
        console.log("Deleting council event with ce_id:", ce_id, "Permanent:", permanent);
        
        // Proper way to structure the request:
        const res = await api.delete(`council/event-meeting/${ce_id}/`, {
            params: { permanent }  // This will properly encode the query parameter
        });
        
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting council event:", err);
        throw err;
    }
};

export const restoreCouncilEvent = async (ce_id: number) => {
    try {
        console.log("Restoring council event with ce_id:", ce_id);
        const res = await api.put(`council/event-meeting/${ce_id}/restore/`);
        console.log("Restore response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error restoring council event:", err);
        throw err;
    }
};

export const delAttendee = async (atn_id: number) => {
    try {
        console.log("Deleting attendee with atn_id:", atn_id);
        const res = await api.delete(`council/attendees/${atn_id}/`);
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting attendee:", err);
        throw err;
    }
};

export const delAttendanceSheet = async (att_id: number, permanent: boolean = false) => {
    if (!att_id || isNaN(att_id)) {
        throw new Error(`Invalid attendance sheet ID: ${att_id}`);
    }

    try {
        console.log("Deleting attendance sheet with att_id:", att_id, "Permanent:", permanent);
        const res = await api.delete(`council/attendance-sheets/${att_id}/`, {
            params: { permanent }
        });
        console.log("Delete response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error deleting attendance sheet:", err);
        throw err;
    }
};

export const restoreAttendanceSheet = async (att_id: number) => {
    try {
        console.log("Restoring attendance sheet with att_id:", att_id);
        const res = await api.put(`council/attendance-sheets/${att_id}/restore/`);
        console.log("Restore response:", res.data);
        return res.data;
    } catch (err) {
        console.error("Error restoring attendance sheet:", err);
        throw err;
    }
};