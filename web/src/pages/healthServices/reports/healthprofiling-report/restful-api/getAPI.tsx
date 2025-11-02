import { api2 } from "@/api/api";
import { PopulationReportResponse } from "../types";

// Fetch population structure report data
export const fetchPopulationStructureReport = async (
  year?: string,
  sitio?: string
): Promise<PopulationReportResponse> => {
  try {
    const params: Record<string, string> = {};
    if (year && year !== "all") params.year = year;
    if (sitio && sitio !== "all") params.sitio = sitio;

    const response = await api2.get(
      `/health-profiling/population-structure-report/`,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching population structure report:", error);
    throw error;
  }
};

// Fetch available sitios for filtering
export const fetchSitios = async () => {
  try {
    const response = await api2.get(`/health-profiling/sitio/list/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sitios:", error);
    throw error;
  }
};

// Fetch yearly population records
export const fetchPopulationYearlyRecords = async () => {
  try {
    const response = await api2.get(`/health-profiling/population-yearly-records/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching yearly population records:", error);
    throw error;
  }
};
