// hooks/doctor-assessed.ts
import { useQuery } from "@tanstack/react-query";
import { getMonthlySummaries, getMonthlyDetails } from "../restful-api/fetch";


export const useMonthlySummaries = (
  page: number,
  pageSize: number,
  search: string,
  staffId?: string
) => {
  return useQuery({
    queryKey: ["monthlySummaries", page, pageSize, search, staffId],
    queryFn: () =>
      getMonthlySummaries(
        page,
        pageSize,
        search === "all" ? "" : search, // Send empty string instead of "all"
        staffId
      ),
  });
};

export const useMonthlyDetails = (
  month: string,
  page: number,
  pageSize: number,
  staffId?: string,
  recordType?: string,
  searchQuery?: string
) => {
  return useQuery({
    queryKey: [
      "monthlyDetails",
      month,
      page,
      pageSize,
      staffId,
      recordType,
      searchQuery,
    ],
    queryFn: () =>
      getMonthlyDetails(month, page, pageSize, staffId, recordType, searchQuery),
  });
};