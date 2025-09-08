

import { useQuery } from "@tanstack/react-query";
import { getMedicineRequestProcessing,getMedicineRequestPending,getMedicineRequestPendingItems} from "../restful-api/get";


export const useProcessingMedrequest = (
  page: number = 1, 
  pageSize: number = 10, 
  search: string = "", 
  dateFilter: string = "all"
) => {
  return useQuery<any>({
    queryKey: ["processingmedrequest", page, pageSize, search, dateFilter],
    queryFn: () => getMedicineRequestProcessing(page, pageSize, search, dateFilter),
  });
};



export const usePendingItemsMedRequest = (
  page?: number, 
  pageSize?: number,
  search?: string,
  dateFilter?: string
) => {
  return useQuery<any>({
    queryKey: ["pendingmedrequestitems", page, pageSize, search, dateFilter],
    queryFn: () => getMedicineRequestPendingItems(page, pageSize, search, dateFilter),
  });
};