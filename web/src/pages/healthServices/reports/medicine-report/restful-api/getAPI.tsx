// getAPI.ts
import { api2 } from "@/api/api";
import {MedicineChartResponse, MedicineRecordsResponse} from "../types";


export const getMedicineMonthly = async (year?: string): Promise<MedicineRecordsResponse> => {
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




export const getMedicineDetailedReports = async (month: string): Promise<MedicineRecordsResponse> => {
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


export  const getMedicineChart = async(month:string)=>{
  try
  {
    const url = `/medicine/medicines-request/monthly/chart/${month}/`;
    const response = await api2.get<MedicineChartResponse>(url);
    console.log("Chart Response:", response.data);
    return response.data;
  }
  catch (error) {
    console.error("Error fetching Vaccination Chart:", error);
    throw error;
  }


}
