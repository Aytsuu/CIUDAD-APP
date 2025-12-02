// fetchQueries.ts
import { useQuery } from "@tanstack/react-query";
import { getMonthlyMorbiditySummary, getMonthlyMorbidityDetails } from "../restful-api/fetch"

export const useMonthlyMorbiditySummary = (page: number, pageSize: number, search: string) => {
  return useQuery({
    queryKey: ["monthlyMorbiditySummary", page, pageSize, search],
    queryFn: () => getMonthlyMorbiditySummary(page, pageSize, search),
  });
};

export const useMonthlyMorbidityDetails = (month: string, page?: number, pageSize?: number, search?: string) => {
  return useQuery({
    queryKey: ["monthlyMorbidityDetails", month, page, pageSize, search],
    queryFn: () => getMonthlyMorbidityDetails(month, page, pageSize, search),
    enabled: !!month, // Only fetch when month is available
  });
};