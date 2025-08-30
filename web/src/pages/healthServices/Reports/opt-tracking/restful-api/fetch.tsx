import { api2 } from "@/api/api";
import { OPTMonthsResponse, OPTMonthlyDetailResponse } from "../types";

export const getOPTMonths = async (
  page: number,
  pageSize: number,
  year?: string,
  searchQuery?: string
): Promise<OPTMonthsResponse> => {
  try {
    const params = new URLSearchParams();
    if (year && year !== 'all') params.append('year', year);
    if (searchQuery) params.append('search', searchQuery);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<OPTMonthsResponse>(`/reports/opt-tracking/monthly/summaries/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching OPT months:", error);
    throw error;
  }
};




export const getMonthlyOPTRecords = async (
  month: string,
  page: number,
  pageSize: number,
  sitio?: string,
  nutritional_status?: string,
  age_range?: string
): Promise<OPTMonthlyDetailResponse> => {
  try {
    const response = await api2.get<OPTMonthlyDetailResponse>(`/reports/opt-tracking/reports/${month}/`, {
      params: {
        page,
        page_size: pageSize,
        sitio,
        nutritional_status,
        age_range,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly OPT records:", error);
    throw error;
  }
};
