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




export const getMedicineReports = async (month: string): Promise<MedicineRecordsResponse> => {
  try {
    const url = `/medicine/medicine-reports/${month}/`;
    const response = await api2.get<MedicineRecordsResponse>(url);
    console.log("First Aid Reports Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching First Aid records:", error);
    throw error;
  }
};

export const getMedicineMonthCount =async()=>{
  try {
    const response = await api2.get("/medicine/month-count/");
    return response.data;
  } catch (error) {
    console.error("Error fetching  :", error);
    throw error;
  }
}