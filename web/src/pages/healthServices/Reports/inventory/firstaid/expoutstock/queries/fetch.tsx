// hooks/firstaid.ts
import { useQuery } from "@tanstack/react-query";
import { 
  getFirstAidExpiredOutOfStockSummary, 
  getMonthlyFirstAidExpiredOutOfStockDetail 
} from "../restful-api/get";

export const useFirstAidExpiredOutOfStockSummary = (
  page: number,
  pageSize: number,
) => {
  return useQuery({
    queryKey: ["firstAidExpiredOutOfStockSummary", page, pageSize],
    queryFn: () => getFirstAidExpiredOutOfStockSummary(page, pageSize),
  });
};

export const useMonthlyFirstAidExpiredOutOfStockDetail = (
  month: string,
) => {
  return useQuery({
    queryKey: ["monthlyFirstAidExpiredOutOfStockDetail", month],
    queryFn: () => getMonthlyFirstAidExpiredOutOfStockDetail(month),
  });
};