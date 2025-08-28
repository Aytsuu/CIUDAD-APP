import { api } from "@/api/api";
import { AxiosError } from "axios";

export type Certificate = {
  cr_id: string;
  resident_details: {
    per_fname: string;
    per_lname: string;
  };
  req_pay_method: string;
  req_request_date: string;
  req_claim_date: string;
  req_type: string;
  req_purpose: string;
  req_payment_status: string;
  req_transac_id: string;
  invoice?: {
    inv_num: string;
    inv_serial_num: string;
    inv_date: string;
    inv_amount: string;
    inv_nat_of_collection: string;
  };
};

export const getCertificates = async (): Promise<Certificate[]> => {
  try {
    const res = await api.get('/clerk/certificate/');
    const raw = res.data as any[];
    const mapped: Certificate[] = (raw || []).map((item: any) => {
      return {
        cr_id: item.cr_id,
        resident_details: item.resident_details || null,
        req_pay_method: item.req_pay_method || 'Walk-in',
        req_request_date: item.cr_req_request_date,
        req_type: item.purpose?.pr_purpose || item.req_type || '',
        req_purpose: item.purpose?.pr_purpose || '',
        req_payment_status: item.cr_req_payment_status,
        req_transac_id: item.req_transac_id || '',
        invoice: item.invoice
          ? {
              inv_num: item.invoice.inv_num,
              inv_serial_num: item.invoice.inv_serial_num,
              inv_date: item.invoice.inv_date,
              inv_amount: item.invoice.inv_amount,
              inv_nat_of_collection: item.invoice.inv_nat_of_collection,
            }
          : undefined,
      } as Certificate;
    });
    return mapped;
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching certificates:', error.response?.data || error.message);
    throw error;
  }
};

export type MarkCertificateVariables = {
  cr_id: string;
  file_url?: string;
  staff_id?: string;
};

export const markCertificateAsIssued = async (certificateData: MarkCertificateVariables) => {
  try {
    const res = await api.post('/clerk/mark-certificate-issued/', certificateData);
    return res.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error marking certificate as issued:', error.response?.data || error.message);
    throw error;
  }
};


