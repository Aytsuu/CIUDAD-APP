import { api } from "@/api/api";
import { AxiosError } from "axios";

export type ServiceCharge = {
  sr_id: string;
  sr_code: string;
  sr_req_date: string;
  req_payment_status: string;
  complainant_name?: string;
  invoice?: {
    inv_num: string;
    inv_serial_num: string;
    inv_date: string;
    inv_amount: string;
    inv_nat_of_collection: string;
  };
  complainant_names?: string[];
  complainant_addresses?: string[];
  accused_names?: string[];
  accused_addresses?: string[];
};

export const getPaidServiceCharges = async (
  searchTerm: string = "",
  page: number = 1,
  pageSize: number = 10
): Promise<{ results: ServiceCharge[]; count: number }> => {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (searchTerm) {
      params.append('search', searchTerm);
    }

    // Always filter for completed service charges only
    params.append('status', 'completed');
    
    // Always filter for paid service charges only
    params.append('payment_status', 'Paid');

    // Fetch from the service charge treasurer list endpoint with pagination
    const res = await api.get(`/clerk/service-charge-treasurer-list/?${params.toString()}`);
    const payload = res.data as any;
    
    const list = Array.isArray(payload?.results) ? payload.results : [];
    const count = payload?.count || 0;

    const merged: ServiceCharge[] = list
      .map((sr: any) => ({
        sr_id: String(sr.pay_id),
        sr_code: sr.sr_code ?? null,
        sr_req_date: sr.pay_date_req ?? '',
        req_payment_status: sr.pay_status ?? 'Paid',
        complainant_name: Array.isArray(sr.complainant_names) && sr.complainant_names.length ? sr.complainant_names[0] : undefined,
        complainant_names: sr.complainant_names ?? [],
        complainant_addresses: sr.complainant_addresses ?? [],
        accused_names: sr.accused_names ?? [],
        accused_addresses: sr.accused_addresses ?? [],
        invoice: undefined,
      }));

    return {
      results: merged,
      count: count
    };
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching service charges:', error.response?.data || error.message);
    // For 500s, return empty to avoid crashing React Query retry logic
    if (error.response?.status === 500) {
      return { results: [], count: 0 };
    }
    throw error;
  }
};
