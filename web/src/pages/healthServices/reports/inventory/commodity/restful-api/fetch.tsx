// commodityAPI.ts
import { api2 } from "@/api/api";
import {
  CommodityMonthsResponse,
  CommodityMonthlyDetailResponse,
} from "../types";

export const getCommodityMonths = async (
  page: number,
  pageSize: number,
  year?: string,
  searchQuery?: string
): Promise<CommodityMonthsResponse> => {
  try {
    const params = new URLSearchParams();
    if (year && year !== "all") params.append("year", year);
    if (searchQuery) params.append("search", searchQuery);
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());

    const response = await api2.get<CommodityMonthsResponse>(
      `/inventory/commodity/summaries/?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching commodity months:", error);
    throw error;
  }
};

export const getMonthlyCommodityRecords = async (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
): Promise<CommodityMonthlyDetailResponse> => {
  try {
    const response = await api2.get<CommodityMonthlyDetailResponse>(
      `/inventory/commodity/records/${month}/`,
      {
        params: {
          page,
          page_size: pageSize,
          search: searchQuery,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly commodity records:", error);
    throw error;
  }
};
