// hooks/commodity.ts
import { useQuery } from "@tanstack/react-query";
import { 
  getCommodityExpiredOutOfStockSummary, 
  getMonthlyCommodityExpiredOutOfStockDetail 
} from "../restful-api/get";

export const useCommodityExpiredOutOfStockSummary = (
  page: number,
  pageSize: number,
) => {
  return useQuery({
    queryKey: ["commodityExpiredOutOfStockSummary", page, pageSize],
    queryFn: () => getCommodityExpiredOutOfStockSummary(page, pageSize),
  });
};

export const useMonthlyCommodityExpiredOutOfStockDetail = (
  month: string,
) => {
  return useQuery({
    queryKey: ["monthlyCommodityExpiredOutOfStockDetail", month],
    queryFn: () => getMonthlyCommodityExpiredOutOfStockDetail(month),
  });
};