import { api } from "@/api/api";
import { AxiosError } from "axios";

// Create a certificate
export const postCertificate = async (certificateData: {
    cr_id: string;
    req_request_date: string;
    req_claim_date: string;
    req_type: string;
    req_status: string;
    req_payment_status: string;
    pr_id: string;
    staff_id: string;
    rp_id: string;
}) => {
  try {
    const res = await api.post('/clerk/certificate/', certificateData);
    return res.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("Error creating certificate:", error);
    console.error('Error details:', error.response?.data || 'No error details available');
    throw error;
  }
};
