// api/deworming-api.ts
import { api2 } from "@/api/api";
import { DewormingYearsResponse, DewormingDetailResponse } from "../types";

export const getDewormingYears = async (
  page: number,
  pageSize: number,
  searchQuery?: string
): Promise<DewormingYearsResponse> => {
  try {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<DewormingYearsResponse>(`/reports/deworming-records/yearly/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching deworming years:", error);
    throw error;
  }
};

export const getDewormingRecords = async (
  year: string,
  page: number,
  pageSize: number,
  round?: string,
  searchQuery?: string
): Promise<DewormingDetailResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (round) params.append('round', round);
    if (searchQuery) params.append('search', searchQuery);

    const response = await api2.get<DewormingDetailResponse>(`/reports/deworming-reports/${year}/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching deworming records:", error);
    throw error;
  }
};