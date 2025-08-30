import { useQuery } from "@tanstack/react-query";
import { getYearlyOPTRecords,getOPTYears } from "../restful-api/fetch";



export const useOPTYears = (
    page: number,
    pageSize: number,
    searchQuery: string = ""
  ) => {
    return useQuery({
      queryKey: ["optYears", page, pageSize, searchQuery],
      queryFn: () => getOPTYears(page, pageSize, searchQuery),
      // Optional: Add any additional options like staleTime, retry, etc.
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };
  export const useYearlyOPTRecords = (
    year: string,
    page: number,
    pageSize: number,
    search?: string,
    nutritional_status?: string,
  ) => {
    return useQuery({
      queryKey: [
        "yearlyOPTRecords", 
        year, 
        page, 
        pageSize, 
        search, 
        nutritional_status,
      ],
      queryFn: () => getYearlyOPTRecords(
        year, 
        page, 
        pageSize, 
        search, 
        nutritional_status,
      ),
    });
  };