import { useQuery } from "@tanstack/react-query";
import { getOPTYears, getSemiAnnualOPTRecords } from "../restful-api/fetch";

export const useOPTYears = (
  page: number,
  pageSize: number,
  searchQuery: string = ""
) => {
  return useQuery({
    queryKey: ["optYears", page, pageSize, searchQuery],
    queryFn: () => getOPTYears(page, pageSize, searchQuery),
  });
};

export const useSemiAnnualOPTRecords = (
  year: string,
  page: number,
  pageSize: number,
  sitio?: string,
  nutritional_status?: string,

) => {
  return useQuery({
    queryKey: [
      "semiAnnualOPTRecords", 
      year, 
      page, 
      pageSize, 
      sitio, 
      nutritional_status, 
      
    ],
    queryFn: () => getSemiAnnualOPTRecords(
      year, 
      page, 
      pageSize, 
      sitio, 
      nutritional_status, 
      
    ),
  });
};