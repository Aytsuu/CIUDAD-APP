// fetchQueries.ts
import { useQuery } from "@tanstack/react-query";
import { getMonthlyChildrenCount, getMonthlyChildrenDetails } from "../restful-api/getAPI"


export const useMonthlyChildrenCount = (page: number, pageSize: number, search: string) => {
  return useQuery({
    queryKey: ["monthlyChildrenCount", page, pageSize, search],
    queryFn: () => getMonthlyChildrenCount(page, pageSize, search),
  });
};



export const useMonthlyChildrenDetails = (month: string, page: number, pageSize: number, search?: string, sitio?: string) => {
  return useQuery({
    queryKey: ["monthlyChildrenDetails", month, page, pageSize, search, sitio],
    queryFn: () => getMonthlyChildrenDetails(month, page, pageSize, search, sitio),
  });
};
