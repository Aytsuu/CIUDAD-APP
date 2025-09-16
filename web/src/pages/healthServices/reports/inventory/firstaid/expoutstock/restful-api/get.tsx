// api/firstaid.ts
import { 
  FirstAidExpiredOutOfStockSummaryResponse, 
  FirstAidExpiredOutOfStockDetailResponse 
} from "../types";
import { api2 } from "@/api/api";

export const getFirstAidExpiredOutOfStockSummary = async (
  page: number,
  pageSize: number,
): Promise<FirstAidExpiredOutOfStockSummaryResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<FirstAidExpiredOutOfStockSummaryResponse>(
      `/inventory/firstaid-expired-out-of-stock-summary/?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching first aid expired/out-of-stock summary:", error);
    throw error;
  }
};

export const getMonthlyFirstAidExpiredOutOfStockDetail = async (
  month: string,
): Promise<FirstAidExpiredOutOfStockDetailResponse> => {
  try {
    const response = await api2.get<FirstAidExpiredOutOfStockDetailResponse>(
      `/inventory/firstaid-expired-out-of-stock-detail/${month}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly first aid expired/out-of-stock detail:", error);
    throw error;
  };
};