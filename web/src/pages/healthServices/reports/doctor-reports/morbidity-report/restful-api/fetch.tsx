// getAPI.ts
import { api2 } from "@/api/api";

export const getMonthlyMorbiditySummary = async (page: number, pageSize: number, search?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const response = await api2.get<any>(`reports/morbidity/monthly-summaries/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly morbidity summary:", error);
    throw error;
  }
};

export const getMonthlyMorbidityDetails = async (month: string, page?: number, pageSize?: number, search?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const url = `reports/morbidity/monthly-details/${month}/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api2.get<any>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly morbidity details:", error);
    throw error;
  }
};