// getAPI.ts
import { api2 } from "@/api/api";



export const getMedicineMonthly = async (page: number, pageSize: number, search?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const response = await api2.get<any>(`/reports/medicine-records/monthly/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine records:", error);
    throw error;
  }
};


// queries/fetchQueries.ts
export const getMedicineDetailedReports = async (
  month: string, 
  page: number = 1, 
  pageSize: number = 30, 
  search?: string
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const url = `/reports/medicine-reports/${month}/?${params.toString()}`;
    const response = await api2.get<any>(url);
    console.log("Medicine Reports Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Medicine records:", error);
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
