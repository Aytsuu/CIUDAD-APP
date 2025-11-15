import { api2 } from "@/api/api";
import type { HealthProfilingSummaryResponse } from "../summary-types";

// Fetch health profiling summary report data
export const fetchHealthProfilingSummary = async (
  year?: string,
  sitio?: string
): Promise<HealthProfilingSummaryResponse> => {
  try {
    const params: Record<string, string> = {};
    if (year && year !== "all") params.year = year;
    if (sitio && sitio !== "all") params.sitio = sitio;

    const response = await api2.get(
      `/health-profiling/health-profiling-summary/`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching health profiling summary:", error);
    throw error;
  }
};
