import { useQuery } from '@tanstack/react-query';
import { getTreasurerServiceCharges, ServiceCharge } from '../restful-api/serviceChargeGetAPI';

export function useTreasurerServiceCharges() {
  return useQuery<ServiceCharge[]>({
    queryKey: ['treasurer-service-charges'],
    queryFn: getTreasurerServiceCharges,
    staleTime: 60 * 1000,
  });
}


