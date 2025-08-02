// getAPI.ts
import { api2 } from "@/api/api";
import { FirstAidRecordsResponse } from "../types";


export const getFirstaidRecords = async (year?: string): Promise<FirstAidRecordsResponse> => {
  try {
    const url = year
      ? `/firstaid/firstaid-records/monthly/?year=${year}`
      : `/firstaid/firstaid-records/monthly/`;
    const response = await api2.get<FirstAidRecordsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching First Aid records:", error);
    throw error;
  }
};


export const getStaffList =async()=>{
  try {
    const response = await api2.get("/reports/healthstaff/");
    return response.data;
  } catch (error) {
    console.error("Error fetching staff list:", error);
    throw error;
  }
}
