// queries/fetch.ts
import { useQuery } from "@tanstack/react-query";
import { getMonthlyData, getVaccinationStatistics, getNutritionStatistics, getDewormingStatistics,getMonthlyMorbidityDetails} from "../restful-api/fetch";

export const useMonthlyData = (page: number, pageSize: number, yearFilter: string, searchQuery: string = "") => {
  return useQuery({
    queryKey: ["monthlyData", page, pageSize, yearFilter, searchQuery],
    queryFn: () => getMonthlyData(page, pageSize, yearFilter === "all" ? undefined : yearFilter, searchQuery),
  });
};

export const useVaccinationStatistics = (month: string) => {
  return useQuery({
    queryKey: ["vaccinationStatistics", month],
    queryFn: () => getVaccinationStatistics(month),
    enabled: !!month,
  });
};

export const useNutritionStatistics = (month: string) => {
  return useQuery({
    queryKey: ["nutritionStatistics", month],
    queryFn: () => getNutritionStatistics(month),
    enabled: !!month,
  });
};

export const useDewormingStatistics = (month: string) => {
  return useQuery({
    queryKey: ["dewormingStatistics", month],
    queryFn: () => getDewormingStatistics(month),
    enabled: !!month,
  });
};



export const useMonthlyMorbidityDetails = (month: string, page?: number, pageSize?: number, search?: string) => {
  return useQuery({
    queryKey: ["monthlyMorbidityDetails", month, page, pageSize, search],
    queryFn: () => getMonthlyMorbidityDetails(month, page, pageSize, search),
    enabled: !!month, // Only fetch when month is available
  });
};