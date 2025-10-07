// getAPI.ts
import { api2 } from "@/api/api";


export const getMedicineMonthly = async (year?: string): Promise<any> => {
  try {
    const url = year
      ? `/reports/medicine-records/monthly/?year=${year}`
      : `/reports/medicine-records/monthly/`;
    const response = await api2.get<any>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching Medicine records:", error);
    throw error;
  }
};




export const getMedicineDetailedReports = async (month: string): Promise<any> => {
  try {
    const url = `/reports/medicine-reports/${month}/`;
    const response = await api2.get<any>(url);
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
    const url = `/reports/medicines-request/monthly/chart/${month}/`;
    const response = await api2.get<any>(url);
    console.log("Chart Response:", response.data);
    return response.data;
  }
  catch (error) {
    console.error("Error fetching Vaccination Chart:", error);
    throw error;
  }


}
