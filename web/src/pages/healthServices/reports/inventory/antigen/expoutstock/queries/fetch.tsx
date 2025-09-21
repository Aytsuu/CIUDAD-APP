// hooks/vaccination.ts
import { useQuery } from "@tanstack/react-query";
import { 
  getVaccinationExpiredOutOfStockSummary, 
  getMonthlyVaccinationExpiredOutOfStockDetail 
} from "../restful-api/get";

export const useVaccinationExpiredOutOfStockSummary = (
  page: number,
  pageSize: number,
) => {
  return useQuery({
    queryKey: ["vaccinationExpiredOutOfStockSummary", page, pageSize],
    queryFn: () => getVaccinationExpiredOutOfStockSummary(page, pageSize),
  });
};

export const useMonthlyVaccinationExpiredOutOfStockDetail = (
  month: string,
) => {
  return useQuery({
    queryKey: ["monthlyVaccinationExpiredOutOfStockDetail", month],
    queryFn: () => getMonthlyVaccinationExpiredOutOfStockDetail(month),
  });
};