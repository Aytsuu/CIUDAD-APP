import { api } from "@/api/api";
import { AxiosError } from "axios";

export type BusinessPermit = {
  bpr_id: string;
  business_name: string;
  business_gross_sales: string;
  business_address?: string;
  req_request_date: string;
  req_status: string;
  req_payment_status: string;
  req_amount?: number;
  ags_id?: number;
  bus_id?: string;
  pr_id?: number;
  staff_id?: string;
  rp_id?: string;
  req_date_completed?: string;
  bus_permit_name?: string;
  bus_permit_address?: string;
  bpf_id?: string | null;
  purpose?: string;
  amount_to_pay?: number;
  requestor?: string;
};

export const getBusinessPermit = async (): Promise<BusinessPermit[]> => {
  try {
    const res = await api.get('/clerk/business-permit/');
    return res.data as BusinessPermit[];
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching business permits:', error.response?.data || error.message);
    throw error;
  }
};

export type MarkBusinessPermitVariables = {
  bpr_id: string;
  file_url?: string;
  staff_id?: string;
};

export const markBusinessPermitAsIssued = async (permitData: MarkBusinessPermitVariables) => {
  try {
    const res = await api.post('/clerk/mark-business-permit-issued/', permitData);
    return res.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error marking business permit as issued:', error.response?.data || error.message);
    throw error;
  }
};
