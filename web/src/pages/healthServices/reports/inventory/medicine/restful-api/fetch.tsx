// medicineAPI.ts
import { api2 } from "@/api/api";
import { MedicineMonthsResponse, MedicineMonthlyDetailResponse } from "../types"

export const getMedicineMonths = async (
  page: number,
  pageSize: number,
  year?: string,
  searchQuery?: string
): Promise<MedicineMonthsResponse> => {
  try {
    const params = new URLSearchParams();
    if (year && year !== 'all') params.append('year', year);
    if (searchQuery) params.append('search', searchQuery);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<MedicineMonthsResponse>(`/reports/medicine/summaries/?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching medicine months:", error);
    }
    // Do not throw in production; only log in development
  }
};

export const getMonthlyMedicineRecords = async (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
): Promise<MedicineMonthlyDetailResponse> => {
  try {
    const response = await api2.get<MedicineMonthlyDetailResponse>(`/reports/medicine/records/${month}/`, {
      params: {
        page,
        page_size: pageSize,
        search: searchQuery,
      },
    });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching monthly medicine records:", error);
    }
    // Do not throw in production; only log in development
  }
};
