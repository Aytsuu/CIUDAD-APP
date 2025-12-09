import { api2 } from "@/api/api";
import { OPTSummaryResponse, OPTMonthlyDetailsResponse } from "../types";

export const getOPTSummaries = async (page: number, pageSize: number, searchQuery?: string): Promise<OPTSummaryResponse | any> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());
    if (searchQuery) params.append("search", searchQuery);

    const response = await api2.get<OPTSummaryResponse>(`/reports/opt-tracking/summary/`, { params });

    // Handle both response formats (with and without pagination wrapper)
    if (response.data && "results" in response.data) {
      return response.data.results as OPTSummaryResponse;
    }

    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching OPT summaries:", error);
    }
  }
};

export const getOPTMonthlyReport = async (month: string, sitio?: string): Promise<OPTMonthlyDetailsResponse | any> => {
  try {
    const response = await api2.get<OPTMonthlyDetailsResponse>(`/reports/opt-tracking/summary/${month}/`, { params: { sitio } });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching OPT monthly report:", error);
    }
  }
};

