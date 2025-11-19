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
  "13_23_months": VaccineStatistic[];
}

export const getVaccinationStatistics = async (month: string): Promise<VaccinationStatisticsResponse> => {
  try {
    const response = await api2.get<VaccinationStatisticsResponse>(`/reports/fhischildhealth-page4/monthly/${month}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching vaccination statistics:", error);
    throw error;
  }
};

export interface NutritionService {
  service_name: string;
  male: number;
  female: number;
  total: number;
}

export interface NutritionalStatusAssessment {
  status_name: string;
  male: number;
  female: number;
  total: number;
}

export interface NutritionStatisticsResponse {
  success: boolean;
  month: string;
  nutrition_services: NutritionService[];
  nutritional_status_assessment: NutritionalStatusAssessment[];
}

export const getNutritionStatistics = async (month: string): Promise<NutritionStatisticsResponse> => {
  try {
    const response = await api2.get<NutritionStatisticsResponse>(`/reports/fhischildhealth-page5/monthly/${month}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching nutrition statistics:", error);
    throw error;
  }
};

export interface DewormingAgeGroup {
  age_group: string;
  male: number;
  female: number;
  total: number;
}

export interface DewormingRound {
  round_number: number;
  round_name: string;
  round_period: string;
  age_groups: DewormingAgeGroup[];
  totals: {
    male: number;
    female: number;
    total: number;
  };
  unknown_age_count: number;
}

export interface DewormingStatisticsResponse {
  success: boolean;
  month: string;
  deworming_category: string;
  deworming_round?: number;
  round_name?: string;
  round_period?: string;
  age_groups?: DewormingAgeGroup[];
  totals?: {
    male: number;
    female: number;
    total: number;
  };
  unknown_age_count?: number;
  rounds?: DewormingRound[];
}

export const getDewormingStatistics = async (month: string): Promise<DewormingStatisticsResponse> => {
  try {
    const response = await api2.get<DewormingStatisticsResponse>(`/reports/deworming-statistics/monthly/${month}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching deworming statistics:", error);
    throw error;
  }
};


export const getMonthlyMorbidityDetails = async (month: string, page?: number, pageSize?: number, search?: string): Promise<any> => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (search) params.append('search', search);

    const url = `reports/morbidity/monthly-details/${month}/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api2.get<any>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly morbidity details:", error);
    throw error;
  }
};