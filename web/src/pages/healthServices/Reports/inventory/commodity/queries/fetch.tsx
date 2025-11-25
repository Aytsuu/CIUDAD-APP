import { useQuery } from "@tanstack/react-query";
import {
  getCommodityMonths,
  getMonthlyCommodityRecords,
} from "../restful-api/fetch";

export const useCommodityMonths = (
  page: number,
  pageSize: number,
  yearFilter: string,
  searchQuery: string = ""
) => {
  return useQuery({
    queryKey: ["commodityMonths", page, pageSize, yearFilter, searchQuery],
    queryFn: () =>
      getCommodityMonths(
        page,
        pageSize,
        yearFilter === "all" ? undefined : yearFilter,
        searchQuery
      ),
  });
};

export const useMonthlyCommodityRecords = (
  month: string,
  page: number,
  pageSize: number,
  searchQuery?: string
) => {
  return useQuery({
    queryKey: ["monthlyCommodityRecords", month, page, pageSize, searchQuery],
    queryFn: () =>
      getMonthlyCommodityRecords(month, page, pageSize, searchQuery),
  });
};
