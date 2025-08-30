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
  sitio?: string,
  nutritional_status?: string,
  age_range?: string
) => {
  return useQuery({
    queryKey: ["monthlyOPTRecords", month, page, pageSize, sitio, nutritional_status, age_range],
    queryFn: () => getMonthlyOPTRecords(month, page, pageSize, sitio, nutritional_status, age_range),
  });
};