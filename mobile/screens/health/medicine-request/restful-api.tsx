
import { useMutation, useQuery } from "@tanstack/react-query";
import { getPendingMedicineRequests, submitMedicineRequest, updateRequestStatus } from "./queries/queries";
import { queryClient } from "@/lib/queryClient";

export const useSubmitMedicineRequest = () => {
  return useMutation({
    mutationFn: submitMedicineRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicineRequests'] });
    },
  });
};

export const usePendingMedicineRequests = (
  page: number,
  pageSize: number,
  search?: string
) => {
  return useQuery({
    queryKey: ["pendingMedicineRequests", page, pageSize, search],
    queryFn: () => getPendingMedicineRequests(page, pageSize, search),
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const useUpdateRequestStatus = () => {
  return useMutation({
    mutationFn: ({ medreq_id, status, doctor_notes }: { 
      medreq_id: number; 
      status: string; 
      doctor_notes?: string 
    }) => updateRequestStatus(medreq_id, status, doctor_notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingMedicineRequests'] });
    },
  });
};