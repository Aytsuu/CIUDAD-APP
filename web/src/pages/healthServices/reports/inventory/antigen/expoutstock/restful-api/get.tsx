// api/vaccination.ts
import { 
  VaccinationExpiredOutOfStockSummaryResponse, 
  VaccinationExpiredOutOfStockDetailResponse 
} from "../types";
import { api2 } from "@/api/api";

export const getVaccinationExpiredOutOfStockSummary = async (
  page: number,
  pageSize: number,
): Promise<VaccinationExpiredOutOfStockSummaryResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<VaccinationExpiredOutOfStockSummaryResponse>(
      `/inventory/vaccination-expired-out-of-stock-summary/?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching vaccination expired/out-of-stock summary:", error);
    throw error;
  }
};

export const getMonthlyVaccinationExpiredOutOfStockDetail = async (
  month: string,
): Promise<VaccinationExpiredOutOfStockDetailResponse> => {
  try {
    const response = await api2.get<VaccinationExpiredOutOfStockDetailResponse>(
      `/inventory/vaccination-expired-out-of-stock-detail/${month}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly vaccination expired/out-of-stock detail:", error);
    throw error;
  };
};