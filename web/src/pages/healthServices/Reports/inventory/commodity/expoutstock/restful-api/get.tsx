// api/commodity.ts
import { 
  CommodityExpiredOutOfStockSummaryResponse, 
  CommodityExpiredOutOfStockDetailResponse 
} from "../types";
import { api2 } from "@/api/api";

export const getCommodityExpiredOutOfStockSummary = async (
  page: number,
  pageSize: number,
): Promise<CommodityExpiredOutOfStockSummaryResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<CommodityExpiredOutOfStockSummaryResponse>(
      `/inventory/commodity-expired-out-of-stock-summary/?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching commodity expired/out-of-stock summary:", error);
    throw error;
  }
};

export const getMonthlyCommodityExpiredOutOfStockDetail = async (
  month: string,
): Promise<CommodityExpiredOutOfStockDetailResponse> => {
  try {
    const response = await api2.get<CommodityExpiredOutOfStockDetailResponse>(
      `/inventory/commodity-expired-out-of-stock-detail/${month}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly commodity expired/out-of-stock detail:", error);
    throw error;
  };
};