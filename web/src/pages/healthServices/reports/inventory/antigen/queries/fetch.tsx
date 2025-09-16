import { useQuery } from "@tanstack/react-query";
import { getVaccineMonths, getMonthlyVaccineRecords } from "../restful-api/fetch";

export const useVaccineMonths = (
  page: number,
  pageSize: number,
  yearFilter: string,
  searchQuery: string = ""
) => {
  return useQuery({
    queryKey: ["vaccineMonths", page, pageSize, yearFilter, searchQuery],
    queryFn: () =>
      getVaccineMonths(
        page,
        pageSize,
        yearFilter === "all" ? undefined : yearFilter,
        searchQuery
      ),
  });
};

export const useMonthlyVaccineRecords = (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
) => {
  return useQuery({
    queryKey: ["monthlyVaccineRecords", month, page, pageSize, searchQuery],
    queryFn: () => getMonthlyVaccineRecords(month, page, pageSize, searchQuery),
  });
};