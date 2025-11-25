import { api } from "@/api/api";
import { AxiosError } from "axios";

// Create a business permit request
export const postBusiness = async (businessData: {
  cr_id: string;
  req_pay_method: string;
  req_request_date: string;
  req_claim_date: string;
  req_transac_id: string;
  req_bsnss_name: string;
  req_bsnss_address: string;
  req_type: string;
  // req_sales_proof field removed
  req_status: string;
  req_payment_status: string;
  ags_id?: string;
  pr_id?: string;
  ra_id?: string;
  staff_id?: string;
}) => {
  try {
    const res = await api.post('/clerk/business-permit/', businessData);
    return res.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("Error creating business permit request:", error);
    console.error('Error details:', error.response?.data || 'No error details available');
    throw error;
  }
};
