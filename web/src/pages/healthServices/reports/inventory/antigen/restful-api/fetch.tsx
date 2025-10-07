import { api2 } from "@/api/api";
import { VaccineMonthsResponse, VaccineMonthlyDetailResponse } from "../types";

export const getVaccineMonths = async (
  page: number,
  pageSize: number,
  year?: string,
  searchQuery?: string
): Promise<VaccineMonthsResponse> => {
  try {
    const params = new URLSearchParams();
    if (year && year !== 'all') params.append('year', year);
    if (searchQuery) params.append('search', searchQuery);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<VaccineMonthsResponse>(`/inventory/vaccine/summaries/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vaccine months:", error);
    throw error;
  }
};

export const getMonthlyVaccineRecords = async (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
): Promise<VaccineMonthlyDetailResponse> => {
  try {
    const response = await api2.get<VaccineMonthlyDetailResponse>(`/inventory/vaccine/records/${month}/`, {
      params: {
        page,
        page_size: pageSize,
        search: searchQuery,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly vaccine records:", error);
    throw error;
  }
};