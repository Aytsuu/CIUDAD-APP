import { api2 } from "@/api/api";
import { OPTYearlyDetailResponse,OPTYearsResponse } from "../types";


export const getOPTYears = async (
    page: number,
    pageSize: number,
    searchQuery?: string
  ): Promise<OPTYearsResponse> => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
  
      const response = await api2.get<OPTYearsResponse>(
        `/reports/opt-tracking/yearly-summaries/?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching OPT years:", error);
      throw error;
    }
  };
export const getYearlyOPTRecords = async (
  year: string,
  page: number,
  pageSize: number,
  sitio?: string,
  nutritional_status?: string,
): Promise<OPTYearlyDetailResponse> => {
  try {
    const response = await api2.get<OPTYearlyDetailResponse>(
      `/reports/opt-tracking/yearly-report/${year}/`,
      {
        params: {
          page,
          page_size: pageSize,
          sitio,
          nutritional_status,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching yearly OPT records:", error);
    throw error;
  }
};