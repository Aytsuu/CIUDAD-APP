import { api } from '@/api/api';

export type ServiceCharge = {
  sr_id: string;
  sr_code: string | null;
  sr_type: string;
  sr_req_date: string;
  sr_req_status: string;
  sr_case_status: string;
  comp_id: number;
  staff_id: number | null;
  complainant_name: string | null;
  pay_reason?: string | null;
  payment_request: {
    spay_id: number;
    spay_status: string;
    spay_due_date: string;
    spay_date_paid: string | null;
    pr_id: number | null;
  } | null;
};

export type ServiceChargeResponse = {
  results: ServiceCharge[];
  count: number;
  next: string | null;
  previous: string | null;
};

export async function getTreasurerServiceCharges(
  search?: string,
  page?: number,
  pageSize?: number,
  tab?: "unpaid" | "paid" | "declined"
): Promise<ServiceChargeResponse> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (page) params.append('page', page.toString());
  if (pageSize) params.append('page_size', pageSize.toString());
  if (tab) params.append('tab', tab);
  
  const { data } = await api.get<ServiceChargeResponse>(`/clerk/treasurer/service-charges/?${params.toString()}`);
  return data ?? { results: [], count: 0, next: null, previous: null };
}

export type PurposeRate = {
  pr_id: number | string;
  pr_purpose: string;
  pr_category: string;
  pr_rate: string | number;
  pr_is_archive?: boolean;
};

// Use existing endpoint: /treasurer/purpose-and-rate/
export async function getServiceChargeRate(): Promise<PurposeRate | null> {
  const { data } = await api.get<PurposeRate[]>(
    '/treasurer/purpose-and-rate/'
  );
  // Filter for Service Charge purpose and return the first match
  const serviceChargeRate = data?.find(item => 
    item.pr_purpose === 'Summons' && 
    item.pr_category === 'Service Charge' && 
    !item.pr_is_archive
  );
  return serviceChargeRate ?? null;
}

export async function createServiceChargePaymentRequest(params: { sr_id: string; pr_id: number | string; spay_amount?: number; spay_status?: string; pay_sr_type?: string; }): Promise<any> {
  const payload = {
    sr_id: params.sr_id,
    pr_id: params.pr_id,
    spay_amount: params.spay_amount,
    spay_status: params.spay_status ?? 'Unpaid',
    pay_sr_type: params.pay_sr_type ?? 'File Action',
  } as const;
  const { data } = await api.post('/clerk/service-charge-payment-req/', payload);
  return data;
}

export async function acceptSummonRequest(sr_id: string): Promise<any> {
  const { data } = await api.put(`/clerk/update-summon-case/${sr_id}/`, { sr_req_status: 'Accepted' });
  return data;
}