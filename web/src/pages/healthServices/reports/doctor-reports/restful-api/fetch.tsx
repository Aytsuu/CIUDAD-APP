// api/doctor-assessed.ts
import { api2 } from "@/api/api";


export const getMonthlySummaries = async (
  page: number,
  pageSize: number,
  search?: string,
  staffId?: string
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (staffId) params.append('staff_id', staffId);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search && search !== "all") params.append('search', search); // Use 'year' parameter instead of 'search'

    const response = await api2.get<any>(
      `/reports/doctor-assessed/monthly-summaries/?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly summaries:", error);
    throw error;
  }
};

export const getMonthlyDetails = async (
  month: string,
  page: number,
  pageSize: number,
  staffId?: string,
  recordType?: string,
  searchQuery?: string
): Promise<any> => {
  try {
    const response = await api2.get<any>(
      `/reports/doctor-assessed/monthly-details/${month}/`,
      {
        params: {
          page,
          page_size: pageSize,
          staff_id: staffId,
          record_type: recordType,
          search: searchQuery,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly details:", error);
    throw error;
  }
};