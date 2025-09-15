import { api } from '@/api/api';

export type ServiceCharge = {
  caseNo: number;
  name: string;
  address1: string;
  respondent: string;
  address2: string;
  reason: string;
  reqDate: string;
};

export async function getTreasurerServiceCharges(): Promise<ServiceCharge[]> {
  const { data } = await api.get<ServiceCharge[]>('/clerk/treasurer/service-charges/');
  return data ?? [];
}


