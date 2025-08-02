
import { api2 } from "@/api/api";
import { VaccineRecordsResponse } from "../types";
export const getVaccineRecords = async (year?: string): Promise<VaccineRecordsResponse> => {
    try {
      const url = year
        ? `/vaccination/vaccination-records/monthly/?year=${year}`
        : `/vaccination/vaccination-records/monthly/`;
      const response = await api2.get<VaccineRecordsResponse>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching Medicine records:", error);
      throw error;
    }
  };