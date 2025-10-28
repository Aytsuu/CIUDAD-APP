import { useMutation, useQuery } from '@tanstack/react-query';
import { getTreasurerServiceCharges, getServiceChargeRate, PurposeRate, createServiceChargePaymentRequest, acceptSummonRequest, ServiceChargeResponse } from '../restful-api/serviceChargeGetAPI';
import { updateServiceChargeStatus, declineServiceChargeRequest } from '../restful-api/serviceChargePostAPI';

export function useTreasurerServiceCharges(search?: string, page?: number, pageSize?: number) {
  return useQuery<ServiceChargeResponse>({
    queryKey: ['treasurer-service-charges', search, page, pageSize],
    queryFn: () => getTreasurerServiceCharges(search, page, pageSize),
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
  return useMutation({
    mutationFn: ({ pay_id, reason }: { pay_id: string | number; reason: string }) => 
      declineServiceChargeRequest(pay_id, reason),
    onSuccess,
  });
}