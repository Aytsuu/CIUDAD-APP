import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getTreasurerServiceCharges, getServiceChargeRate, PurposeRate, createServiceChargePaymentRequest, acceptSummonRequest, ServiceChargeResponse } from '../restful-api/serviceChargeGetAPI';
import { updateServiceChargeStatus, declineServiceChargeRequest } from '../restful-api/serviceChargePostAPI';
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";

export function useTreasurerServiceCharges(search?: string, page?: number, pageSize?: number, tab?: "unpaid" | "paid" | "declined") {
  return useQuery<ServiceChargeResponse>({
    queryKey: ['treasurer-service-charges', search, page, pageSize, tab],
    queryFn: () => getTreasurerServiceCharges(search, page, pageSize, tab),
    staleTime: 60 * 1000,
  });
}

export function useCreateServiceChargePaymentRequest(onSuccess?: () => void) {
  return useMutation({
    mutationFn: createServiceChargePaymentRequest,
    onSuccess,
  });
}

export function useAcceptSummonRequest(onSuccess?: () => void) {
  return useMutation({
    mutationFn: acceptSummonRequest,
    onSuccess,
  });
}

export function useServiceChargeRate() {
  return useQuery<PurposeRate | null>({
    queryKey: ['service-charge-rate'],
    queryFn: getServiceChargeRate,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateServiceChargeStatus(onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({ pay_id, data }: { pay_id: string | number; data: { sr_code?: string; pay_status?: string } }) => 
      updateServiceChargeStatus(pay_id, data),
    onSuccess,
  });
}

export function useDeclineServiceChargeRequest(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pay_id, reason, staff_id }: { pay_id: string | number; reason: string; staff_id?: string | number }) => 
      declineServiceChargeRequest(pay_id, reason, staff_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treasurer-service-charges'] });
      showSuccessToast('Request Declined!');
      onSuccess?.();
    },
    onError: (err) => {
      console.error("Error declining service charge request", err);
      showErrorToast("Failed to decline request. Please check the data and try again.");
    }
  });
}