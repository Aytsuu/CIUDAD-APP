import api from "@/pages/api/api";
import { Staff } from "../queries/fetchqueries";

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

export const getAttendees = async () => {
    try {
        const res = await api.get('council/attendees/',{
            params: { is_archive: false }  // Filter non-archived
        });
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error fetching attendees:", err);
        return [];
    }
};

export const getAttendanceSheets = async () => {
    try {
        const res = await api.get('council/attendance-sheet/',{
            params: { is_archive: false }  // Filter non-archived
        });
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error fetching attendance sheets:", err);
        return [];
    }
};

export const getStaffList = async () => {
  try {
    const res = await api.get('council/api/staff'); // Use an endpoint that fetches all staff
    // Ensure staff_id is returned as a string
    return res.data.map((item: any) => ({
      staff_id: String(item.staff_id), // Force string conversion
      full_name: item.full_name || `Unknown (ID: ${item.staff_id})`,
      position_title: item.position_title || "No Designation",
    })) as Staff[];
  } catch (err) {
    console.error('Error fetching staff list:', err);
    return [];
  }
};