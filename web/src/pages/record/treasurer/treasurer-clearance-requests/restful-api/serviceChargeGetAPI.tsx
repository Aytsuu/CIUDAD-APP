import { api } from '@/api/api';

export type ServiceCharge = {
  sr_id: string;
  caseNo: number;
  name: string;
  address1: string;
  respondent: string;
  address2: string;
  reason: string;
  reqDate: string;
  status?: string;
};

export async function getTreasurerServiceCharges(): Promise<ServiceCharge[]> {
  const { data } = await api.get<ServiceCharge[]>('/clerk/treasurer/service-charges/');
  return data ?? [];
}

export type PurposeRate = {
  pr_id: number | string;
  pr_purpose: string;
  pr_category: string;
  pr_rate: string | number;
};

// Use existing endpoint: /treasurer/get-pr-id/?pr_purpose=Summons&pr_category=Service Charge&pr_is_archive=false
export async function getServiceChargeRate(): Promise<PurposeRate | null> {
  const { data } = await api.get<PurposeRate>(
    '/treasurer/get-pr-id/',
    { params: { pr_purpose: 'Summons', pr_category: 'Service Charge', pr_is_archive: false } }
  );
  return (data as any) ?? null;
}

export async function createServiceChargePaymentRequest(params: { sr_id: string; pr_id: number | string; spay_amount?: number; spay_status?: string; }): Promise<any> {
  const payload = {
    sr_id: params.sr_id,
    pr_id: params.pr_id,
    spay_amount: params.spay_amount,
    spay_status: params.spay_status ?? 'Unpaid',
  } as const;
  const { data } = await api.post('/clerk/service-charge-payment-request/', payload);
  return data;
}

export async function acceptSummonRequest(sr_id: string): Promise<any> {
  const { data } = await api.put(`/clerk/update-summon-request/${sr_id}/`, { sr_req_status: 'Accepted' });
  return data;
}


