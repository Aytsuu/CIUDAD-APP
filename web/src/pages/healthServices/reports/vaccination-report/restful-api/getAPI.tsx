import { api2 } from "@/api/api";
export const getVaccineRecords = async (year?: string): Promise<any> => {
  try {
    const url = year ? `/vaccination/vaccination-records/monthly/?year=${year}` : `/vaccination/vaccination-records/monthly/`;
    const response = await api2.get<any>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching Medicine records:", error);
    throw error;
  }
};

export const getVaccineReports = async (month: string): Promise<any> => {
  try {
    const url = `/vaccination/vaccination-reports/${month}/`;
    const response = await api2.get<any>(url);
    console.log("Reports Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching First Aid records:", error);
    throw error;
  }
};

