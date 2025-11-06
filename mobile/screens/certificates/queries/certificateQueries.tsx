import { AxiosError } from "axios";
import { getCertificates as getCertificatesAPI } from "../restful-api/certificateGetAPI";

// Enhanced types for web backend compatibility
export interface Certificate {
  cr_id: string;
  resident_details: {
    per_fname: string;
    per_lname: string;
  } | null;
  req_pay_method: string;
  req_request_date: string;
  req_claim_date: string;
  req_type: string;
  req_purpose: string;
  req_status: string;
  req_payment_status: string;
  req_transac_id: string;
  is_nonresident?: boolean;
  nrc_id?: string;
  nrc_lname?: string;
  nrc_fname?: string;
  nrc_mname?: string;
  nrc_address?: string;
  nrc_birthdate?: string;
  invoice?: {
    inv_num: string;
    inv_serial_num: string;
    inv_date: string;
    inv_amount: string;
    inv_nat_of_collection: string;
  };
}

export interface MarkCertificateVariables {
  cr_id: string;
  file_url?: string;
  staff_id?: string;
}

export const getCertificates = async (
  search?: string,
  page?: number,
  pageSize?: number,
  status?: string,
  paymentStatus?: string,
  purpose?: string
): Promise<{results: Certificate[], count: number, next: string | null, previous: string | null}> => {
  try {
    const rawData = await getCertificatesAPI(search, page, pageSize, status, paymentStatus, purpose);
    
    const mapped: Certificate[] = (rawData.results || []).map((item: any) => {
      return {
        cr_id: item.cr_id,
        resident_details: item.resident_details || null,
        req_pay_method: item.req_pay_method || 'Walk-in',
        req_request_date: item.cr_req_request_date,
        req_claim_date: item.cr_req_claim_date,
        req_type: item.purpose?.pr_purpose || item.req_type || '',
        req_purpose: item.purpose?.pr_purpose || '',
        req_status: item.req_status || 'Pending',
        req_payment_status: item.cr_req_payment_status,
        req_transac_id: item.req_transac_id || '',
        is_nonresident: item.is_nonresident || false,
        nrc_id: item.nrc_id,
        nrc_lname: item.nrc_lname,
        nrc_fname: item.nrc_fname,
        nrc_mname: item.nrc_mname,
        nrc_address: item.nrc_address,
        nrc_birthdate: item.nrc_birthdate,
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
    
    console.log('Web backend mapped certificates:', mapped);
    return {
      results: mapped,
      count: rawData.count,
      next: rawData.next,
      previous: rawData.previous
    };
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error in certificate queries:', error.response?.data || error.message);
    throw error;
  }
};


export { getCertificateById, searchCertificates, getPersonalClearances } from '../restful-api/certificateGetAPI';


export const markCertificateAsIssued = async (certificateData: MarkCertificateVariables) => {
  try {
    console.log('Making request to /clerk/mark-certificate-issued/');
   
    throw new Error('markCertificateAsIssued not implemented in mobile API layer');
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error marking certificate as issued:', error.response?.data || error.message);
    throw error;
  }
};
