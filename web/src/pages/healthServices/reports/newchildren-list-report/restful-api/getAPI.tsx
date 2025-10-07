// getAPI.ts
import { api2 } from "@/api/api";
import { MonthlyChildrenResponse, MonthlyChildrenDetailResponse } from "../types";

export const getMonthlyChildrenCount = async (year?: string): Promise<MonthlyChildrenResponse> => {
  try {
    const url = year
      ? `reports/new-monthly-children/?year=${year}`
      : `reports/new-monthly-children/`;
    const response = await api2.get<MonthlyChildrenResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly children count:", error);
    throw error;
  }
};

export const getMonthlyChildrenDetails = async (month: string): Promise<MonthlyChildrenDetailResponse> => {
  try {
    const url = `reports/new-monthly-children-details/${month}/`;
    const response = await api2.get<MonthlyChildrenDetailResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly children details:", error);
    throw error;
  }
};