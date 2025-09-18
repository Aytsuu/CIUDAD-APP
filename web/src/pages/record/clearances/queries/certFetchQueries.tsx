import { api } from "@/api/api";
import { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { getStaffList } from "../restful-api/certificateGetAPI";

export type Certificate = {
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

export type ServiceCharge = {
  sr_id: string;
  sr_code: string;
  sr_req_date: string;
  req_payment_status: string;
  complainant_name?: string;
  invoice?: {
    inv_num: string;
    inv_serial_num: string;
    inv_date: string;
    inv_amount: string;
    inv_nat_of_collection: string;
  };
  complainant_names?: string[];
  complainant_addresses?: string[];
  accused_names?: string[];
  accused_addresses?: string[];
};

export const getPaidServiceCharges = async (): Promise<ServiceCharge[]> => {
  try {
    // Use existing treasurer endpoint that already joins payment_request
    const res = await api.get('/clerk/treasurer/service-charges/');
    const list = (res.data ?? []) as any[];

    const merged: ServiceCharge[] = (list || [])
      .filter((sr: any) => (sr.payment_request?.spay_status ?? '').toLowerCase() === 'paid')
      .map((sr: any) => ({
        sr_id: String(sr.sr_id),
        sr_code: sr.sr_code ?? null,
        sr_req_date: sr.sr_req_date ?? '',
        req_payment_status: sr.payment_request?.spay_status ?? 'Paid',
        complainant_name: sr.complainant_name ?? undefined,
        complainant_names: sr.complainant_names ?? [],
        complainant_addresses: sr.complainant_addresses ?? [],
        accused_names: sr.accused_names ?? [],
        accused_addresses: sr.accused_addresses ?? [],
        invoice: undefined,
      }));

    merged.sort((a, b) => new Date(b.sr_req_date).getTime() - new Date(a.sr_req_date).getTime());

    return merged;
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching service charges:', error.response?.data || error.message);
    throw error;
  }
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

export const getCertificates = async (): Promise<Certificate[]> => {
  try {
    // Fetch resident certificates
    const residentRes = await api.get('/clerk/certificate/');
    const residentRaw = residentRes.data as any[];
    
    // Fetch non-resident certificates
    const nonResidentRes = await api.get('/clerk/nonresident-personal-clearance/');
    const nonResidentRaw = nonResidentRes.data as NonResidentCertificate[];

    // Map resident certificates
    const residentCertificates: Certificate[] = (residentRaw || []).map((item: any) => {
      return {
        cr_id: item.cr_id,
        resident_details: item.resident_details || null,
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

    // Map non-resident certificates to Certificate format
    const nonResidentCertificates: Certificate[] = nonResidentRaw
      .filter((item: NonResidentCertificate) => item.nrc_req_payment_status === "Paid")
      .map((item: NonResidentCertificate) => {
        // Split the requester name into first and last name
        const nameParts = item.nrc_requester.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return {
          cr_id: `NRC-${item.nrc_id}`, // Prefix to distinguish non-resident certificates
          nrc_id: item.nrc_id,
          resident_details: {
            per_fname: firstName,
            per_lname: lastName,
          },
          req_pay_method: 'Walk-in', // Default for non-residents
          req_request_date: item.nrc_req_date,
          req_claim_date: item.nrc_pay_date || item.nrc_req_date,
          req_type: item.purpose?.pr_purpose || '',
          req_purpose: item.purpose?.pr_purpose || '',
          req_payment_status: item.nrc_req_payment_status,
          req_transac_id: '',
          is_nonresident: true,
          nrc_requester: item.nrc_requester,
          nrc_address: item.nrc_address,
          nrc_birthdate: item.nrc_birthdate,
        } as Certificate;
      });

    // Combine both arrays
    const allCertificates = [...residentCertificates, ...nonResidentCertificates];
    
    // Sort by request date (newest first)
    allCertificates.sort((a, b) => new Date(b.req_request_date).getTime() - new Date(a.req_request_date).getTime());

    return allCertificates;
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


