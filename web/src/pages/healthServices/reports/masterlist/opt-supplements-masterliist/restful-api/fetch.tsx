import { api2 } from "@/api/api";
import { 
  ChildHealthSupplementsExportResponse,
  ChildHealthSupplementsAlternativeResponse,
  ChildHealthSupplementsResponse 
} from "../types";

export const getChildHealthSupplementsReport = async (
  search?: string,
  page?: number,
  pageSize?: number,
  exportAll?: boolean
): Promise<ChildHealthSupplementsResponse | undefined> => {
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
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching child health supplements report:", error);
    }
    // Do not throw in production; only log in development
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