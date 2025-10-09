

import { api2 } from "@/api/api";

  export const getMonthlyData = async (
    page: number,
    pageSize: number,
    year?: string,
    searchQuery?: string
  ): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (year && year !== 'all') params.append('year', year);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
  
      const response = await api2.get<any>(`/reports/fhis/monthly/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      throw error;
    }
  };
  
 