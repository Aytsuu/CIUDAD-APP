// fetchQueries.ts
import { useQuery } from "@tanstack/react-query";
import { getMonthlyChildrenCount, getMonthlyChildrenDetails } from "../restful-api/getAPI"

export const useMonthlyChildrenCount = (yearFilter: string) => {
  return useQuery({
    queryKey: ["monthlyChildrenCount", yearFilter],
    queryFn: () =>
      getMonthlyChildrenCount(yearFilter === "all" ? undefined : yearFilter),
  });
};

export const useMonthlyChildrenDetails = (month: string) => {
  return useQuery({
    queryKey: ["monthlyChildrenDetails", month],
    queryFn: () => getMonthlyChildrenDetails(month),
  });
};