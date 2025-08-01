import { api } from "@/api/api";
import { Staff } from "../ce-att-types";

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
