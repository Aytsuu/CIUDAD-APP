// getAPI.ts
import { api2 } from "@/api/api";

export const getMonthlyChildrenCount = async (page: number, pageSize: number, search?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const response = await api2.get<any>(`reports/new-monthly-children/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly children count:", error);
    throw error;
  }
};

export const getMonthlyChildrenDetails = async (month: string, page: number, pageSize: number, search?: string, sitio?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);
    if (sitio) params.append('sitio', sitio);

    const url = `reports/new-monthly-children-details/${month}/?${params.toString()}`;
    const response = await api2.get<any>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly children details:", error);
    throw error;
  }
};