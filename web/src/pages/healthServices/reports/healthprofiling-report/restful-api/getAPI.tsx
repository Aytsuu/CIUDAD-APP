import { api2 } from "@/api/api";
import { PopulationReportResponse } from "../types";

// Fetch population structure report data
export const fetchPopulationStructureReport = async (
  year?: string,
  sitio?: string
): Promise<PopulationReportResponse |undefined > => {
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
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching population structure report:", error);
    }
    // Do not throw in production; only log in development
  }
};

// Fetch available sitios for filtering
export const fetchSitios = async () => {
  try {
    const response = await api2.get(`/health-profiling/sitio/list/`);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching sitios:", error);
    }
    // Do not throw in production; only log in development
  }
};

// Fetch yearly population records
export const fetchPopulationYearlyRecords = async () => {
  try {
    const response = await api2.get(`/health-profiling/population-yearly-records/`);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching yearly population records:", error);
    }
    // Do not throw in production; only log in development
  }
};

// Fetch population by sitio report
export const fetchPopulationBySitio = async (year?: string) => {
  try {
    const params: Record<string, string> = {};
    if (year && year !== "all") params.year = year;

    const response = await api2.get(`/health-profiling/population-by-sitio/`, { params });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching population by sitio:", error);
    }
    // Do not throw in production; only log in development
  }
};
