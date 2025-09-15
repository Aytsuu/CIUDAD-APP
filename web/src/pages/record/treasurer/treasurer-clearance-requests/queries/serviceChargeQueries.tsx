import { useMutation, useQuery } from '@tanstack/react-query';
import { getTreasurerServiceCharges, getServiceChargeRate, ServiceCharge, PurposeRate, createServiceChargePaymentRequest, acceptSummonRequest } from '../restful-api/serviceChargeGetAPI';

export function useTreasurerServiceCharges() {
  return useQuery<ServiceCharge[]>({
    queryKey: ['treasurer-service-charges'],
    queryFn: getTreasurerServiceCharges,
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


