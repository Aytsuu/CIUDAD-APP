// getAPI.ts
import { api2 } from "@/api/api";
import {MedicineRecordsResponse} from "../types";


export const getMedicineRecords = async (year?: string): Promise<MedicineRecordsResponse> => {
  try {
    const url = year
      ? `/medicine/medicine-records/monthly/?year=${year}`
      : `/medicine/medicine-records/monthly/`;
    const response = await api2.get<MedicineRecordsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching Medicine records:", error);
    throw error;
  }
};