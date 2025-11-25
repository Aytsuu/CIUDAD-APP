import { api2 } from "@/api/api";



export const getVaccineRecords = async (page: number, pageSize: number, search?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const response = await api2.get<any>(`/vaccination/vaccination-records/monthly/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vaccine records:", error);
    throw error;
  }
};


// queries/fetchQueries.ts
export const getVaccineReports = async (
  month: string, 
  page: number = 1, 
  pageSize: number = 18, 
  search?: string
): Promise<any> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const url = `/vaccination/vaccination-reports/${month}/?${params.toString()}`;
    const response = await api2.get<any>(url);
    console.log("Vaccination Reports Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching Vaccination records:", error);
    throw error;
  }
};

