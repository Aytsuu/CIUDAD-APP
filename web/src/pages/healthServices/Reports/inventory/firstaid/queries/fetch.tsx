import { useQuery } from "@tanstack/react-query";
import { getFirstAidMonths, getMonthlyFirstAidRecords } from "../restful-api/fetch";

export const useFirstAidMonths = (
  page: number,
  pageSize: number,
  yearFilter: string,
  searchQuery: string = ""
) => {
  return useQuery({
    queryKey: ["firstAidMonths", page, pageSize, yearFilter, searchQuery],
    queryFn: () =>
      getFirstAidMonths(
        page,
        pageSize,
        yearFilter === "all" ? undefined : yearFilter,
        searchQuery
      ),
  });
};

export const useMonthlyFirstAidRecords = (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
) => {
  return useQuery({
    queryKey: ["monthlyFirstAidRecords", month, page, pageSize, searchQuery],
    queryFn: () => getMonthlyFirstAidRecords(month, page, pageSize, searchQuery),
  });
};