import { AxiosError } from "axios";
import { api } from "@/api/api";

export interface UnpaidCertificate {
  cr_id: string;
  resident_details: {
    per_fname: string;
    per_lname: string;
    per_mname?: string;
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
  amount?: string;
  decline_reason?: string;
}

export interface UnpaidBusinessPermit {
  bp_id: string;
  business_name: string;
  business_type: string;
  owner_name: string;
  business_address: string;
  req_request_date: string;
  req_status: string;
  req_payment_status: string;
  req_transac_id: string;
  decline_reason?: string;
}

export interface UnpaidServiceCharge {
  sr_id: string;
  sr_code: string;
  sr_req_date: string;
  req_payment_status: string;
  pay_sr_type?: string;
  complainant_name?: string;
  complainant_names?: string[];
  complainant_addresses?: string[];
  accused_names?: string[];
  accused_addresses?: string[];
  decline_reason?: string;
}

export const getUnpaidCertificates = async (
  search?: string,
  page?: number,
  pageSize?: number,
  paymentStatus?: string
): Promise<{results: UnpaidCertificate[], count: number, next: string | null, previous: string | null}> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    
    // Fetch resident certificates
    const queryString = params.toString();
    const residentUrl = `/clerk/personal-clearances${queryString ? `?${queryString}` : ''}`;
    const residentRes = await api.get(residentUrl);
    const residentPayload = residentRes.data as any;

    // Fetch non-resident certificates
    const nonResidentUrl = `/clerk/nonresident-personal-clearance${queryString ? `?${queryString}` : ''}`;
    const nonResidentRes = await api.get(nonResidentUrl);
    const nonResidentPayload = nonResidentRes.data as any;

    // Combine resident and non-resident data
    const residentItems: any[] = Array.isArray(residentPayload)
      ? residentPayload
      : Array.isArray(residentPayload?.results)
      ? residentPayload.results
      : Array.isArray(residentPayload?.data)
      ? residentPayload.data
      : [];

    const nonResidentItems: any[] = Array.isArray(nonResidentPayload)
      ? nonResidentPayload
      : Array.isArray(nonResidentPayload?.results)
      ? nonResidentPayload.results
      : Array.isArray(nonResidentPayload?.data)
      ? nonResidentPayload.data
      : [];

    // Normalize resident certificates
    const normalizedResident: UnpaidCertificate[] = residentItems.map((item: any) => ({
      cr_id: String(item.cr_id ?? item.id ?? ''),
      resident_details: item.resident_details || null,
      req_pay_method: item.req_pay_method || 'Walk-in',
      req_request_date: item.cr_req_request_date || item.req_request_date || '',
      req_claim_date: item.cr_req_claim_date || item.req_claim_date || '',
      req_type: item.purpose?.pr_purpose || item.req_type || '',
      req_purpose: item.purpose?.pr_purpose || item.req_purpose || '',
      req_status: item.cr_req_status || item.req_status || 'Pending',
      req_payment_status: item.cr_req_payment_status || item.req_payment_status || 'Unpaid',
      req_transac_id: item.req_transac_id || '',
      is_nonresident: false,
      nrc_id: undefined,
      nrc_lname: undefined,
      nrc_fname: undefined,
      nrc_mname: undefined,
      amount: item.purpose?.pr_rate || item.amount || item.invoice?.inv_amount || '0',
      decline_reason: item.cr_reason || item.nrc_reason || '',
    }));

    // Normalize non-resident certificates
    const normalizedNonResident: UnpaidCertificate[] = nonResidentItems.map((item: any) => ({
      cr_id: String(item.nrc_id ?? item.id ?? ''),
      resident_details: null,
      req_pay_method: item.req_pay_method || 'Walk-in',
      req_request_date: item.nrc_req_date || item.req_request_date || '',
      req_claim_date: item.req_claim_date || '',
      req_type: item.purpose?.pr_purpose || item.req_type || '',
      req_purpose: item.purpose?.pr_purpose || item.req_purpose || '',
      req_status: item.nrc_req_status || item.req_status || 'Pending',
      req_payment_status: item.nrc_req_payment_status || item.req_payment_status || 'Unpaid',
      req_transac_id: item.req_transac_id || '',
      is_nonresident: true,
      nrc_id: String(item.nrc_id ?? ''),
      nrc_lname: item.nrc_lname,
      nrc_fname: item.nrc_fname,
      nrc_mname: item.nrc_mname,
      amount: item.purpose?.pr_rate || item.amount || '0',
      decline_reason: item.nrc_reason || item.cr_reason || '',
    }));

    // Combine both arrays
    const normalized = [...normalizedResident, ...normalizedNonResident];

    // Calculate combined count
    const residentCount = residentPayload?.count ?? normalizedResident.length;
    const nonResidentCount = nonResidentPayload?.count ?? normalizedNonResident.length;
    const count = residentCount + nonResidentCount;

    return { results: normalized, count, next: null, previous: null };
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching certificates:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      return { results: [], count: 0, next: null, previous: null };
    }
    throw error;
  }
};

export const getUnpaidBusinessPermits = async (
  search?: string,
  page?: number,
  pageSize?: number,
  paymentStatus?: string
): Promise<{results: UnpaidBusinessPermit[], count: number, next: string | null, previous: string | null}> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (paymentStatus && paymentStatus !== 'all') {
      params.append('payment_status', paymentStatus);
    }
    
    const queryString = params.toString();
    const url = `/clerk/permit-clearances${queryString ? `?${queryString}` : ''}`;
    const res = await api.get(url);
    const payload = res.data as any;

    const rawItems: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    const normalized: UnpaidBusinessPermit[] = rawItems.map((item: any) => ({
      bp_id: String(item.bp_id ?? item.bpr_id ?? item.id ?? ''),
      business_name: item.business_name || item.bus_permit_name || '',
      business_type: item.business_type || '',
      owner_name: item.owner_name || item.requestor || '',
      business_address: item.business_address || item.bus_permit_address || '',
      req_request_date: item.req_request_date || '',
      req_status: item.req_status || 'Pending',
      req_payment_status: item.req_payment_status || 'Unpaid',
      req_transac_id: item.req_transac_id || '',
      decline_reason: item.bpr_reason || item.req_declined_reason || item.decline_reason || '',
    }));

    const count = payload?.count ?? normalized.length;
    const next = payload?.next ?? null;
    const previous = payload?.previous ?? null;
    return { results: normalized, count, next, previous };
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching unpaid business permits:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      return { results: [], count: 0, next: null, previous: null };
    }
    throw error;
  }
};

export const getUnpaidServiceCharges = async (
  search?: string,
  page?: number,
  pageSize?: number,
  paymentStatus?: string
): Promise<{results: UnpaidServiceCharge[], count: number, next: string | null, previous: string | null}> => {
  try {
    // Fetch both "File Action" and "Summon" types
    const types = ['File Action', 'Summon'];
    const allResults: any[] = [];
    
    // Fetch each type separately and combine results
    for (const type of types) {
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (page) params.append('page', page.toString());
        if (pageSize) params.append('page_size', pageSize.toString());
        params.append('status', 'pending');
        params.append('sr_type', type);
        
        const queryString = params.toString();
        const url = `/clerk/service-charge-treasurer-list${queryString ? `?${queryString}` : ''}`;
        const res = await api.get(url);
        const payload = res.data as any;

        const rawItems: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        allResults.push(...rawItems);
      } catch (typeErr) {
        // If one type fails, continue with the other
        console.error(`Error fetching service charges for type ${type}:`, typeErr);
      }
    }

    const normalized: UnpaidServiceCharge[] = allResults.map((item: any) => ({
      sr_id: String(item.pay_id ?? item.sr_id ?? ''),
      sr_code: item.sr_code ?? '',
      sr_req_date: item.pay_date_req ?? item.sr_req_date ?? '',
      req_payment_status: item.pay_status ?? 'Unpaid',
      pay_sr_type: item.pay_sr_type ?? item.sr_type ?? '',
      complainant_name: Array.isArray(item.complainant_names) && item.complainant_names.length ? item.complainant_names[0] : undefined,
      complainant_names: item.complainant_names ?? [],
      complainant_addresses: item.complainant_addresses ?? [],
      accused_names: item.accused_names ?? [],
      accused_addresses: item.accused_addresses ?? [],
      decline_reason: item.decline_reason || item.req_declined_reason || item.sr_reason || '',
    }));

    return { 
      results: normalized, 
      count: normalized.length, 
      next: null, 
      previous: null 
    };
  } catch (err) {
    const error = err as AxiosError;
    console.error('Error fetching unpaid service charges:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      return { results: [], count: 0, next: null, previous: null };
    }
    throw error;
  }
};

