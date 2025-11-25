import { api2 } from "@/api/api";
import { OPTYearsResponse, SemiAnnualDetailResponse } from "../types";

export const getOPTYears = async (
  page: number,
  pageSize: number,
  searchQuery?: string
): Promise<OPTYearsResponse> => {
  try {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    params.append('page', page.toString());
    params.append('page_size', pageSize.toString());

    const response = await api2.get<OPTYearsResponse>(`/reports/opt-tracking/yearly-summaries-semi-annual/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching OPT years:", error);
    throw error;
  }
};

export const getSemiAnnualOPTRecords = async (
  year: string,
  page: number,
  pageSize: number,
  sitio?: string,
  nutritional_status?: string,
  
): Promise<SemiAnnualDetailResponse> => {
  try {
    const response = await api2.get<SemiAnnualDetailResponse>(`/reports/opt-tracking/semi-annual-report/${year}/`, {
      params: {
        page,
        page_size: pageSize,
        sitio,
        nutritional_status,
    
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching semi-annual OPT records:", error);
    throw error;
  }
};