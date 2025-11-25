import { useQuery } from "@tanstack/react-query";
import { getMedicineExpiredOutOfStockSummary,getMonthlyMedicineExpiredOutOfStockDetail  } from "../restful-api/get";


export const useMedicineExpiredOutOfStockSummary = (
    page: number,
    pageSize: number,
  ) => {
    return useQuery({
      queryKey: ["medicineExpiredOutOfStockSummary", page, pageSize],
      queryFn: () => getMedicineExpiredOutOfStockSummary(page, pageSize),
    });
  };
  
  export const useMonthlyMedicineExpiredOutOfStockDetail = (
    month: string,
  ) => {
    return useQuery({
      queryKey: ["monthlyMedicineExpiredOutOfStockDetail", month],
      queryFn: () => getMonthlyMedicineExpiredOutOfStockDetail(month),
    });
  };