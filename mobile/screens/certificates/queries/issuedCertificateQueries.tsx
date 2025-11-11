import { AxiosError } from "axios";
import { api } from "@/api/api";

export interface IssuedCertificate {
  ic_id: string;
  cr_id: string;
  requester: string;
  dateIssued: string;
  purpose: string;
  original_certificate?: {
    cr_id: string;
    req_purpose: string;
    req_type: string;
    req_request_date: string;
    req_claim_date: string;
    req_pay_method: string;
    req_payment_status: string;
    req_transac_id: string;
  };
}

export interface IssuedBusinessPermit {
  ibp_id: string;
  bpr_id: string;
  business_name: string;
  dateIssued: string;
  purpose: string;
  original_permit?: {
    bpr_id: string;
    req_purpose: string;
    req_type: string;
    req_request_date: string;
    req_claim_date: string;
    req_pay_method: string;
    req_payment_status: string;
    req_transac_id: string;
  };
}

export interface IssuedServiceCharge {
  sr_id: string;
  sr_code: string;
  sr_req_date: string;
  req_payment_status: string;
  complainant_name?: string;
  complainant_names?: string[];
  complainant_addresses?: string[];
  accused_names?: string[];
  accused_addresses?: string[];
}

export const getIssuedCertificates = async (
  search?: string,
  page?: number,
  pageSize?: number,
  purpose?: string
): Promise<{results: IssuedCertificate[], count: number, next: string | null, previous: string | null}> => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (page) params.append('page', String(page));
    if (pageSize) params.append('page_size', String(pageSize));
    if (purpose && purpose !== 'All') params.append('purpose', purpose);
    const url = `/clerk/issued-certificates/${params.toString() ? `?${params.toString()}` : ''}`;

    const res = await api.get(url);
    const payload = res.data as any;

    const rawItems: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    const normalized: IssuedCertificate[] = rawItems.map((item: any) => ({
      ic_id: String(item.ic_id ?? item.id ?? ''),
      cr_id: String(item.cr_id ?? item.original_certificate?.cr_id ?? ''),
      requester: item.requester ?? item.requester_name ?? item.name ?? '',
      dateIssued: item.dateIssued ?? item.ic_date_of_issuance ?? item.date_issued ?? '',
      purpose: item.purpose ?? item.pr_purpose ?? item.req_purpose ?? '',
      original_certificate: item.original_certificate,
    }));

    const count = payload?.count ?? normalized.length;
    const next = payload?.next ?? null;
    const previous = payload?.previous ?? null;
    return { results: normalized, count, next, previous };
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 500) {
      // Fallback: backend may not support pagination params; retry without query
      try {
        const res = await api.get('/clerk/issued-certificates/');
        const payload = res.data as any;
        const rawItems: any[] = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        const normalized: IssuedCertificate[] = rawItems.map((item: any) => ({
          ic_id: String(item.ic_id ?? item.id ?? ''),
          cr_id: String(item.cr_id ?? item.original_certificate?.cr_id ?? ''),
          requester: item.requester ?? item.requester_name ?? item.name ?? '',
          dateIssued: item.dateIssued ?? item.ic_date_of_issuance ?? item.date_issued ?? '',
          purpose: item.purpose ?? item.pr_purpose ?? item.req_purpose ?? '',
          original_certificate: item.original_certificate,
        }));

        return {
          results: normalized,
          count: normalized.length,
          next: null,
          previous: null,
        };
      } catch (_fallbackErr) {
        return { results: [], count: 0, next: null, previous: null };
      }
    }
    throw error;
  }
};

export const getIssuedBusinessPermits = async (
  search?: string,
  page?: number,
  pageSize?: number,
  purpose?: string
): Promise<{results: IssuedBusinessPermit[], count: number, next: string | null, previous: string | null}> => {
  try {
    const res = await api.get('/clerk/issued-business-permits/');
    const payload = res.data as any;

    const rawItems: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    let normalized: IssuedBusinessPermit[] = rawItems.map((item: any) => ({
      ibp_id: String(item.ibp_id ?? item.id ?? ''),
      bpr_id: String(item.bpr_id ?? item.original_permit?.bpr_id ?? item.permit_request?.bpr_id ?? ''),
      business_name: item.business_name ?? item.name ?? item.permit_request?.business_name ?? '',
      dateIssued: item.dateIssued ?? item.ibp_date_of_issuance ?? item.permit_request?.req_date_completed ?? '',
      purpose: item.purpose ?? item.pr_purpose ?? item.req_purpose ?? item.permit_request?.purpose ?? '',
      original_permit: item.original_permit ?? item.permit_request,
    }));

    if (purpose && purpose !== 'All') {
      const p = purpose.toLowerCase();
      normalized = normalized.filter((it) => (it.purpose || '').toLowerCase().includes(p));
    }
    
    if (search) {
      const s = search.toLowerCase();
      normalized = normalized.filter(
        (it) => it.business_name.toLowerCase().includes(s) || (it.purpose || '').toLowerCase().includes(s)
      );
    }

    const total = normalized.length;
    const current = page && pageSize ? normalized.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : normalized;
    return { results: current, count: total, next: null, previous: null };
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 500) {
      return { results: [], count: 0, next: null, previous: null };
    }
    throw error;
  }
};

export const getIssuedServiceCharges = async (
  search?: string,
  page?: number,
  pageSize?: number
): Promise<{results: IssuedServiceCharge[], count: number, next: string | null, previous: string | null}> => {
  try {
    // For now, use the paid service charges endpoint
    // Note: This may need to be adjusted based on actual backend endpoint
    const res = await api.get('/clerk/service-charge-treasurer-list/?status=pending&payment_status=Paid&sr_type=File Action');
    const payload = res.data as any;

    const rawItems: any[] = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.data)
      ? payload.data
      : [];

    let normalized: IssuedServiceCharge[] = rawItems.map((item: any) => ({
      sr_id: String(item.pay_id ?? item.sr_id ?? ''),
      sr_code: item.sr_code ?? '',
      sr_req_date: item.pay_date_req ?? item.sr_req_date ?? '',
      req_payment_status: item.pay_status ?? 'Paid',
      complainant_name: Array.isArray(item.complainant_names) && item.complainant_names.length ? item.complainant_names[0] : undefined,
      complainant_names: item.complainant_names ?? [],
      complainant_addresses: item.complainant_addresses ?? [],
      accused_names: item.accused_names ?? [],
      accused_addresses: item.accused_addresses ?? [],
    }));

    if (search) {
      const s = search.toLowerCase();
      normalized = normalized.filter(
        (it) => 
          (it.sr_code?.toLowerCase().includes(s) ?? false) ||
          (it.complainant_name?.toLowerCase().includes(s) ?? false) ||
          (it.complainant_names?.some(name => name.toLowerCase().includes(s)) ?? false)
      );
    }

    const total = normalized.length;
    const current = page && pageSize ? normalized.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) : normalized;
    return { results: current, count: total, next: null, previous: null };
  } catch (err) {
    const error = err as AxiosError;
    if (error.response?.status === 500) {
      return { results: [], count: 0, next: null, previous: null };
    }
    throw error;
  }
};
