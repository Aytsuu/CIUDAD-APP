import { api2 } from "@/api/api";

export const getMonthlyData = async (page: number, pageSize: number, year?: string, searchQuery?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (year && year !== "all") params.append("year", year);
    if (searchQuery) params.append("search", searchQuery);
    params.append("page", page.toString());
    params.append("page_size", pageSize.toString());

    const response = await api2.get<any>(`/reports/fhis/monthly/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    throw error;
  }
};

export interface VaccineStatistic {
  vaccine_name: string;
  male: number;
  female: number;
  total: number;
}

export interface VaccinationStatisticsResponse {
  success: boolean;
  month: string;
  special_vaccines: VaccineStatistic[];
  "0_12_months": VaccineStatistic[];
  "12_23_months": VaccineStatistic[];
}

export const getVaccinationStatistics = async (month: string): Promise<VaccinationStatisticsResponse> => {
  try {
    const response = await api2.get<VaccinationStatisticsResponse>(
      `/reports/fhischildhealth-page4/monthly/${month}/`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching vaccination statistics:", error);
    throw error;
  }
};
