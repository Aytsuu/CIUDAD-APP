import { api } from "@/api/api";
import { AxiosError } from "axios";

export type BusinessPermit = {
  bpr_id: string;
  business_name: string;
  business_gross_sales: string;
  req_sales_proof: string;
  req_pay_method: string;
  req_request_date: string;
  req_claim_date: string;
  req_status: string;
  req_payment_status: string;
  req_transac_id: string;
  req_purpose?: string;
  pr_id?: string;
  business_address?: string;
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
