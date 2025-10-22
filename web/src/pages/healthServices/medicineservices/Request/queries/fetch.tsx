import { useQuery } from "@tanstack/react-query";
import { getMedicineRequestProcessing, getMedicineRequestPending, getMedicineRequestPendingItems, getMedicineRequestStatuses, getMedicineRequestStatusesDetails } from "../restful-api/get";

export const useProcessingMedrequest = (page: number = 1, pageSize: number = 10, search: string = "", dateFilter: string = "all") => {
  return useQuery<any>({
    queryKey: ["processingmedrequest", page, pageSize, search, dateFilter],
    queryFn: () => getMedicineRequestProcessing(page, pageSize, search, dateFilter)
  });
};

export const usePendingMedRequest = (page?: number, pageSize?: number, search?: string, dateFilter?: string) => {
  return useQuery<any>({
    queryKey: ["pendingmedrequest", page, pageSize, search, dateFilter],
    queryFn: () => getMedicineRequestPending(page, pageSize, search, dateFilter)
  });
};

export const usePendingItemsMedRequest = (medreqId: string, page?: number, pageSize?: number) => {
  return useQuery<any>({
    queryKey: ["pendingmedrequestitems", medreqId, page, pageSize],
    queryFn: () => getMedicineRequestPendingItems(medreqId, page, pageSize),
    enabled: !!medreqId
  });
};

export const useMedicineRequestStatuses = (page: number, pageSize: number, search: string, dateFilter: string, status?: string) => {
  return useQuery<any>({
    queryKey: ["pendingmedrequest", page, pageSize, search, dateFilter, status],
    queryFn: () => getMedicineRequestStatuses(page, pageSize, search, dateFilter, status)
  });
};

export const useMedicineRequestStatusesDetails = (id: string, page?: number, pageSize?: number, status?: string) => {
  return useQuery<any>({
    queryKey: ["pendingmedrequestitems", id, page, pageSize, status],
    queryFn: () => getMedicineRequestStatusesDetails(id, page, pageSize, status),
    enabled: !!id
  });
};
