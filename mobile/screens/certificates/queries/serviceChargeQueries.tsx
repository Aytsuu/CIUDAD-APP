import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/api';

export type ServiceCharge = {
  sr_id: string;
  sr_code: string;
  sr_req_date: string;
  req_payment_status: string;
  pay_sr_type?: string;
  complainant_name?: string;
  complainant_names?: string[];
  complainant_addresses?: string[];
  accused_names?: string[];
  accused_addresses?: string[];
  invoice?: {
    inv_num: string;
    inv_serial_num: string;
    inv_date: string;
    inv_amount: string;
    inv_nat_of_collection: string;
  };
};

export const getPaidServiceCharges = async (): Promise<ServiceCharge[]> => {
  try {
    
    const params = new URLSearchParams({
      status: 'pending',
      payment_status: 'Unpaid',
      sr_type: 'File Action',
    });

    const res = await api.get(`/clerk/service-charge-treasurer-list/?${params.toString()}`);
    const payload = res.data as any;
    
    const list = Array.isArray(payload?.results) ? payload.results : [];

    const merged: ServiceCharge[] = list
      .map((sr: any) => ({
        sr_id: String(sr.pay_id),
        sr_code: sr.sr_code ?? null,
        sr_req_date: sr.pay_date_req ?? '',
        req_payment_status: sr.pay_status ?? 'Paid',
        pay_sr_type: sr.pay_sr_type ?? sr.sr_type ?? '',
        complainant_name: Array.isArray(sr.complainant_names) && sr.complainant_names.length ? sr.complainant_names[0] : undefined,
        complainant_names: sr.complainant_names ?? [],
        complainant_addresses: sr.complainant_addresses ?? [],
        accused_names: sr.accused_names ?? [],
        accused_addresses: sr.accused_addresses ?? [],
        invoice: undefined,
      }));

    return merged;
  } catch (err) {
    console.error('Error fetching service charges:', err);
    return [];
  }
};

export const useServiceCharges = () => {
  return useQuery({
    queryKey: ['serviceCharges'],
    queryFn: getPaidServiceCharges,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
