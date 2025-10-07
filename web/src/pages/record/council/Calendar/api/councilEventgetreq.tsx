import { api } from "@/api/api";
import { Staff } from "../councilEventTypes";

export const getCouncilEvents = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  year?: string,
  isArchive?: boolean
): Promise<{ results: any[]; count: number }> => {
  try {
    const params: any = {
      page,
      page_size: pageSize,
    };
    
    if (searchQuery) params.search = searchQuery;
    if (year && year !== "all") params.year = year;
    if (isArchive !== undefined) params.is_archive = isArchive;
    
    const res = await api.get("council/event-meeting/", { params });
    
    // Handle paginated response
    if (res.data.results) {
      return {
        results: res.data.results || [],
        count: res.data.count || 0
      };
    }
    
    // Handle non-paginated response (fallback)
    const data = res.data?.data ?? res.data ?? [];
    return {
      results: Array.isArray(data) ? data : [],
      count: Array.isArray(data) ? data.length : 0
    };
  } catch (err) {
    console.error('Error fetching council events:', err);
    return { results: [], count: 0 };
  }
};

export const getCouncilEventYears = async (): Promise<number[]> => {
  try {
    const res = await api.get("council/event-meeting/years/");
    return res.data || [];
  } catch (err) {
    console.error('Error fetching council event years:', err);
    return [];
  }
};

// export const getAttendees = async (ceId?: number) => {
//   try {
//     const res = await api.get("council/attendees/", {
//       params: { ce_id: ceId, is_archive: false },
//     });
//     const data = res.data?.data ?? res.data ?? [];
//     return Array.isArray(data) ? data : [];
//   } catch (err) {
//     return [];
//   }
// };

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
