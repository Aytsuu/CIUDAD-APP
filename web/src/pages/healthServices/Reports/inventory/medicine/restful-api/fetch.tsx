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

    const response = await api2.get<MedicineMonthsResponse>(`/inventory/medicine/summaries/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine months:", error);
    throw error;
  }
};

export const getMonthlyMedicineRecords = async (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
): Promise<MedicineMonthlyDetailResponse> => {
  try {
    const response = await api2.get<MedicineMonthlyDetailResponse>(`/inventory/medicine/records/${month}/`, {
      params: {
        page,
        page_size: pageSize,
        search: searchQuery,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly medicine records:", error);
    throw error;
  }
};
