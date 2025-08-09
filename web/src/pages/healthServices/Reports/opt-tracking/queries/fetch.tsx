import { useQuery } from "@tanstack/react-query";
import { getOPTMonths, getMonthlyOPTRecords } from "../restful-api/fetch";

export const useOPTMonths = (
  page: number,
  pageSize: number,
  yearFilter: string,
  searchQuery: string = ""
) => {
  return useQuery({
    queryKey: ["optMonths", page, pageSize, yearFilter, searchQuery],
    queryFn: () =>
      getOPTMonths(
        page,
        pageSize,
        yearFilter === "all" ? undefined : yearFilter,
        searchQuery
      ),
  });
};

export const useMonthlyOPTRecords = (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
) => {
  return useQuery({
    queryKey: ["monthlyOPTRecords", month, page, pageSize, searchQuery],
    queryFn: () => getMonthlyOPTRecords(month, page, pageSize, searchQuery),
  });
};