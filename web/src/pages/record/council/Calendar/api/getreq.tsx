import api from "@/pages/api/api";

export const getCouncilEvents = async () => {
    try {
        const res = await api.get('council/event-meeting/');
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error fetching council events:", err);
        return [];
    }
};

export const getAttendees = async () => {
    try {
        const res = await api.get('council/attendees/');
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error fetching attendees:", err);
        return [];
    }
};

export const getAttendanceSheets = async () => {
    try {
        const res = await api.get('council/attendance-sheet/');
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error fetching attendance sheets:", err);
        return [];
    }
};

export const getStaffList = async (): Promise<{ staff_id: number; full_name: string }[]> => {
  try {
    console.log('getStaffList - Fetching staff list');
    const res = await api.get('gad/api/staff/');
    console.log('getStaffList - Response data:', res.data);
    const data = res.data?.data ?? res.data ?? [];
    return data.map((staff: any) => ({
      staff_id: staff.staff_id,
      full_name: staff.full_name,
    }));
  } catch (err) {
    console.error('getStaffList - Error fetching staff list:', err);
    return [];
  }
};