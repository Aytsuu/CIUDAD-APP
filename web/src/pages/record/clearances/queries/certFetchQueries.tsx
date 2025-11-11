import { api } from "@/api/api";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { getStaffList } from "../restful-api/certificateGetAPI";

export type Certificate = {
  cr_id: string;
  resident_details: {
    per_fname: string;
    per_mname?: string;
    per_lname: string;
    per_dob?: string;
    per_address?: string;
    per_addresses?: Array<{
      add_street?: string;
      add_external_sitio?: string;
      add_barangay?: string;
      add_city?: string;
      add_province?: string;
    }>;
    per_is_deceased?: boolean;
  } | null;
  req_pay_method: string;
  req_request_date: string;
  req_claim_date: string;
  req_type: string;
  req_purpose: string;
  req_payment_status: string;
  req_transac_id: string;
  is_nonresident?: boolean;
  nrc_id?: string; // For non-resident certificates
  nrc_lname?: string; // Non-resident last name
  nrc_fname?: string; // Non-resident first name
  nrc_mname?: string; // Non-resident middle name
  nrc_address?: string; // Non-resident address
  nrc_birthdate?: string; // Non-resident birthdate
  invoice?: {
    inv_num: string;
    inv_serial_num: string;
    inv_date: string;
    inv_amount: string;
    inv_nat_of_collection: string;
  };
};


export type NonResidentCertificate = {
  nrc_id: string;
  nrc_req_date: string;
  nrc_req_status: string;
  nrc_req_payment_status: string;
  nrc_pay_date: string | null;
  nrc_lname: string;
  nrc_fname: string;
  nrc_mname: string;
  nrc_address: string;
  nrc_birthdate: string;
  purpose: {
    pr_purpose: string;
    pr_rate: string;
  } | null;
  amount: string;
};

export type MarkCertificateVariables = {
  cr_id: string;
  file_url?: string;
  staff_id?: string;
  is_nonresident?: boolean;
  nrc_id?: string;
};

export const getCertificates = async (search?: string, page?: number, pageSize?: number, status?: string, purpose?: string, paymentStatus?: string): Promise<{results: Certificate[], count: number, next: string | null, previous: string | null}> => {
  try {
    // Build query parameters for the combined endpoint
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (status) params.append('status', status);
    if (purpose) params.append('purpose', purpose);
    if (paymentStatus) params.append('payment_status', paymentStatus);
    
    const queryString = params.toString();
    const url = `/clerk/certificate-all/${queryString ? '?' + queryString : ''}`;
    
    // Fetch from the combined endpoint
    const response = await api.get(url);
    
    // The combined endpoint already returns the properly formatted data
    return response.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching certificates:', error.response?.data || error.message);
    throw error;
  }
};

// Mark certificate as issued/printed
export const markCertificateAsIssued = async (certificateData: {
  cr_id: string;
  file_url?: string;
  staff_id?: string;
  is_nonresident?: boolean;
  nrc_id?: string;
}): Promise<any> => {
  try {
    const response = await api.post('/clerk/mark-certificate-issued/', certificateData);
    return response.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error marking certificate as issued:', error.response?.data || error.message);
    throw error;
  }
};

// Get staff list for dropdowns
export const useGetStaffList = () => {
  return useQuery({
    queryKey: ['staff-list'],
    queryFn: getStaffList,
  });
};
