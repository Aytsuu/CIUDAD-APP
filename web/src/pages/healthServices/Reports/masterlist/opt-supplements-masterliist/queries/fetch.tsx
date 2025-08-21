import { useQuery } from "@tanstack/react-query";
import { 
  getChildHealthSupplementsReport,
} from "../restful-api/fetch";
import { 
  ChildHealthSupplementsReportResponse,

} from "../types";

export const useChildHealthSupplementsReport = (
  search?: string,
  page?: number,
  pageSize?: number
) => {
  return useQuery({
    queryKey: ["childHealthSupplementsReport", search, page, pageSize],
    queryFn: () => getChildHealthSupplementsReport(search, page, pageSize),
    select: (data): ChildHealthSupplementsReportResponse => {
      // Ensure we always return the paginated format for the main view
      if ('results' in data && 'count' in data && !('export' in data)) {
        return data as ChildHealthSupplementsReportResponse;
      }
      // Handle other formats by converting them
      if ('children' in data) {
        return {
          count: data.total_children,
          next: null,
          previous: null,
          results: data.children
        };
      }
      if ('export' in data) {
        return {
          count: data.count,
          next: null,
          previous: null,
          results: data.results
        };
      }
    
      return data as ChildHealthSupplementsReportResponse;
    }
  });
};

