import { api } from "@/api/api";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { getStaffList } from "../restful-api/certificateGetAPI";

export type Certificate = {
  cr_id: string;
  resident_details: {
    per_fname: string;
    per_lname: string;
    per_dob?: string;
    per_address?: string;
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
  nrc_requester?: string; // Non-resident requester name
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
  nrc_requester: string;
  nrc_address: string;
  nrc_birthdate: string;
  pr_id: number;
  purpose: {
    pr_purpose: string;
    pr_rate: string;
  } | null;
  amount: string;
};

export const getCertificates = async (search?: string, page?: number, pageSize?: number, status?: string, paymentStatus?: string): Promise<{results: Certificate[], count: number, next: string | null, previous: string | null}> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (status) params.append('status', status);
    if (paymentStatus) params.append('payment_status', paymentStatus);
    
    const queryString = params.toString();
    const url = `/clerk/certificate/${queryString ? '?' + queryString : ''}`;
    
    // Fetch resident certificates with pagination
    const residentRes = await api.get(url);
    const residentData = residentRes.data;
    
    // Handle both paginated and non-paginated responses
    const residentRaw = residentData.results || residentData;
    const residentCount = residentData.count || residentRaw.length;
    const residentNext = residentData.next || null;
    const residentPrevious = residentData.previous || null;
    
    // For now, we'll only return resident certificates with pagination
    // Non-resident certificates can be added later if needed
    const residentCertificates: Certificate[] = (residentRaw || []).map((item: any) => {
      
      return {
        cr_id: item.cr_id,
        resident_details: item.resident_details ? {
          per_fname: item.resident_details.per_fname,
          per_lname: item.resident_details.per_lname,
          per_dob: item.resident_details.per_dob,
          per_address: item.resident_details.per_address,
        } : null,
        req_pay_method: item.req_pay_method || 'Walk-in',
        req_request_date: item.cr_req_request_date,
        req_type: item.purpose?.pr_purpose || item.req_type || '',
        req_purpose: item.purpose?.pr_purpose || '',
        req_payment_status: item.cr_req_payment_status,
        req_transac_id: item.req_transac_id || '',
        is_nonresident: false,
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

    // For now, we'll only return resident certificates with pagination
    // Non-resident certificates can be added later if needed
    return {
      results: residentCertificates,
      count: residentCount,
      next: residentNext,
      previous: residentPrevious
    };
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching certificates:', error.response?.data || error.message);
    throw error;
  }
};

export type MarkCertificateVariables = {
  cr_id: string;
  nrc_id?: string;
  file_url?: string;
  staff_id?: string;
  is_nonresident?: boolean;
};

export const markCertificateAsIssued = async (certificateData: MarkCertificateVariables) => {
  try {
    // Use different endpoint for non-resident certificates if needed
    if (certificateData.is_nonresident && certificateData.nrc_id) {
      // For now, using the same endpoint, but you might need different logic
      // You may need to create a separate endpoint for non-resident certificates
      // Update the non-resident certificate status first
      await api.patch(`/clerk/update-personal-req-status/${certificateData.nrc_id}/`, {
        nrc_req_status: 'Completed'
      });
      
      return { success: true, message: "Non-resident certificate marked as issued" };
    } else {
      // Always omit staff_id to avoid backend staff creation with null pos_id
      const payload = { cr_id: certificateData.cr_id };
      console.log('Mark issued payload (resident):', payload);
      const res = await api.post('/clerk/mark-certificate-issued/', payload);
      // Also update resident certificate status to Issued
      try {
        await api.put(`/clerk/certificate-update-status/${certificateData.cr_id}/`, {
          cr_req_status: 'Completed',
          cr_date_completed: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to set resident certificate status to Issued (non-fatal):', (err as any)?.response?.data || (err as any)?.message);
      }
      return res.data;
    }
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error marking certificate as issued:', error.response?.data || error.message);
    throw error;
  }
};



export type Staff = {
  staff_id: string;
  full_name: string;
  position_title: string;
};

export const useGetStaffList = () =>
  useQuery<Staff[], Error>({
    queryKey: ["staffList"],
    queryFn: getStaffList,
  });

