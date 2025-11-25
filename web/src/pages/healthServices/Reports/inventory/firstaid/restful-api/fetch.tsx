import { api2 } from "@/api/api";
import { FirstAidMonthsResponse, FirstAidMonthlyDetailResponse } from "../types";

export const getFirstAidMonths = async (
  page: number,
  pageSize: number,
  year?: string,
  searchQuery?: string
): Promise<FirstAidMonthsResponse> => {
  try {
    const params = new URLSearchParams();
    if (year && year !== 'all') params.append('year', year);
    if (searchQuery) params.append('search', searchQuery);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<FirstAidMonthsResponse>(`/inventory/firstaid/summaries/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching first aid months:", error);
    throw error;
  }
};

export const getMonthlyFirstAidRecords = async (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
): Promise<FirstAidMonthlyDetailResponse> => {
  try {
    const response = await api2.get<FirstAidMonthlyDetailResponse>(`/inventory/firstaid/records/${month}/`, {
      params: {
        page,
        page_size: pageSize,
        search: searchQuery,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly first aid records:", error);
    throw error;
  }
};