// api/vaccination.ts

import { api2 } from "@/api/api";

export const getVaccinationExpiredOutOfStockSummary = async (
  page: number,
  pageSize: number,
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<any>(
      `/inventory/vaccination-expired-out-of-stock-summary/?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching vaccination expired/out-of-stock summary:", error);
    }
    // Do not throw in production; only log in development
  }
};

export const getMonthlyVaccinationExpiredOutOfStockDetail = async (
  month: string,
): Promise<any> => {
  try {
    const response = await api2.get<any>(
      `/inventory/vaccination-expired-out-of-stock-detail/${month}/`
    );
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching monthly vaccination expired/out-of-stock detail:", error);
    }
    // Do not throw in production; only log in development
  }
};