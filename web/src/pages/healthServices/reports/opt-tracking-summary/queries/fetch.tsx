import { useQuery } from "@tanstack/react-query";
import { getOPTSummaries, getOPTMonthlyReport} from "../restful-api/fetch";

export const useOPTSummaries = (
    page: number, 
    pageSize: number, 
    searchQuery: string
  ) => {
    return useQuery({
      queryKey: ["optSummaries", page, pageSize, searchQuery],
      queryFn: () => getOPTSummaries(page, pageSize, searchQuery),
    });
  };

  export const useOPTMonthlyReport = (month: string, sitio?: string) => {
    return useQuery({
      queryKey: ["optMonthlyReport", month, sitio],
      queryFn: () => getOPTMonthlyReport(month, sitio),
    });
  };

