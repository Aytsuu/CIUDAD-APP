import { api2 } from "@/api/api";
import { 
  ChildHealthSupplementsReportResponse, 
  ChildHealthSupplementsExportResponse,
  ChildHealthSupplementsAlternativeResponse,
  ChildHealthSupplementsResponse 
} from "../types";

export const getChildHealthSupplementsReport = async (
  search?: string,
  page?: number,
  pageSize?: number,
  exportAll?: boolean
): Promise<ChildHealthSupplementsResponse> => {
  try {
    const response = await api2.get<ChildHealthSupplementsResponse>(
      `reports/supplements/report/`,
      { 
        params: { 
          search: search || undefined,
          page: exportAll ? undefined : page,
          page_size: exportAll ? undefined : pageSize,
          export: exportAll ? 'true' : undefined
        } 
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching child health supplements report:", error);
    throw error;
  }
};

// Specific function for exports that returns the export response type
export const getFullChildHealthSupplementsReport = async (
  search?: string
): Promise<ChildHealthSupplementsExportResponse | ChildHealthSupplementsAlternativeResponse> => {
  return getChildHealthSupplementsReport(search, undefined, undefined, true) as Promise<
    ChildHealthSupplementsExportResponse | ChildHealthSupplementsAlternativeResponse
  >;
};