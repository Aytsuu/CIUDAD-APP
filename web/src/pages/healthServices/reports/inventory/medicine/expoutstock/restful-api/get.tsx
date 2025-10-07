import { api2 } from "@/api/api";


export const getMedicineExpiredOutOfStockSummary = async (
    page: number,
    pageSize: number,
  ): Promise<any> => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
  
      const response = await api2.get<any>(
        `/reports/medicine-expired-out-of-stock-summary/?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching medicine expired/out-of-stock summary:", error);
      throw error;
    }
  };
  
  export const getMonthlyMedicineExpiredOutOfStockDetail = async (
    month: string,
  ): Promise<any> => {
    try {
      const response = await api2.get<any>(
        `/reports/medicine-expired-out-of-stock-detail/${month}/`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly medicine expired/out-of-stock detail:", error);
      throw error;
    };
  };