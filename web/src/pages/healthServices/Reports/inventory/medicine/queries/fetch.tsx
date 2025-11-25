import { useQuery } from "@tanstack/react-query";
import { getMedicineMonths, getMonthlyMedicineRecords } from "../restful-api/fetch";

export const useMedicineMonths = (
    page: number,
    pageSize: number,
    yearFilter: string,
    searchQuery: string = ""
  ) => {
    return useQuery({
      queryKey: ["medicineMonths", page, pageSize, yearFilter, searchQuery],
      queryFn: () =>
        getMedicineMonths(
          page,
          pageSize,
          yearFilter === "all" ? undefined : yearFilter,
          searchQuery
        ),
    });
  };
  

export const useMonthlyMedicineRecords = (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
) => {
  return useQuery({
    queryKey: ["monthlyMedicineRecords", month, page, pageSize, searchQuery],
    queryFn: () => getMonthlyMedicineRecords(month, page, pageSize, searchQuery),
  });
};
